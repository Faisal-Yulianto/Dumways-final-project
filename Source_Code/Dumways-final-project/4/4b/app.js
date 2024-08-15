const express = require('express');
const path = require('path');
const hbs = require('hbs');
const { sequelize } = require('./models'); 
const { users_tb, provinsi_tb, kabupaten_tb } = require('./models');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const upload = require("./middleware/upload");
const bcrypt = require('bcrypt');
const port = 3000;
const app = express();

// Setup view engine
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// Setup folder statis
app.use("/assets", express.static("assets"));
app.use(express.urlencoded({ extended: false })); 
app.use(
    session({
      secret: "your_secret_key", 
      resave: false,
      saveUninitialized: false,
    })
);
app.use(flash());
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.session = req.session;
    next();
});
app.use(methodOverride('_method'));
hbs.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

// Routing get
app.get('/', async (req, res) => {
    try {
        const provinsi = await provinsi_tb.findAll({
            include: [{ model: kabupaten_tb, as: 'kabupaten' }] 
        });
        res.render('index', {
            provinsi: provinsi,
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg')
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Kesalahan saat mengambil data.');
        res.redirect('/');
    }
});

// Login
app.get("/login", async (req, res) => {
    res.render("login");
});
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await users_tb.findOne({ where: { email } });
        if (user && (await bcrypt.compare(password, user.password))) {
            req.session.user_id = user.id;
            req.flash("success_msg", "Login berhasil!");
            res.redirect("/");
        } else {
            req.flash("error_msg", "Username atau password tidak valid.");
            res.redirect("/login");
        }
    } catch (error) {
        console.error('Kesalahan basis data:', error);
        req.flash("error_msg", "Kesalahan saat login.");
        res.redirect("/login");
    }
});

// Register
app.get("/register", async (req, res) => {
    res.render("register");
});
app.post("/register", async (req, res) => {
    const { email, password, username } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const existingUser = await users_tb.findOne({ where: { email } });
        if (existingUser) {
            req.flash("error_msg", "Email sudah pernah dipakai.");
            return res.redirect("/register");
        }
        await users_tb.create({
            username,
            email,
            password: hashedPassword,
        });
        req.flash("success_msg", "Registrasi berhasil! Silakan login.");
        res.redirect("/login");
    } catch (error) {
        console.error(error);
        req.flash("error_msg", "Kesalahan saat mendaftarkan pengguna baru.");
        res.redirect("/register");
    }
});

// Add provinsi
app.get('/provinsi/add', (req, res) => {
    if (!req.session.user_id) {
        req.flash('error_msg', 'Anda perlu login untuk menambahkan provinsi.');
        return res.redirect('/login');
    }
    res.render('addProvinsi');
});
app.post('/provinsi/add', upload.single('photo'), async (req, res) => {
    if (!req.session.user_id) {
        req.flash('error_msg', 'Anda perlu login untuk menambahkan provinsi.');
        return res.redirect('/login');
    }
    const { nama, diresmikan, pulau } = req.body;
    try {
        await provinsi_tb.create({
            nama,
            diresmikan,
            photo: req.file ? req.file.filename : null,
            pulau,
            user_id: req.session.user_id,
        });
        req.flash('success_msg', 'Provinsi berhasil ditambahkan.');
        res.redirect('/');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Kesalahan saat menambahkan provinsi.');
        res.redirect('/provinsi/add');
    }
});

// Add kabupaten
app.get('/kabupaten/add', async (req, res) => {
    if (!req.session.user_id) {
        req.flash('error_msg', 'Anda perlu login untuk menambahkan kabupaten.');
        return res.redirect('/login');
    }

    try {
        const provinsiList = await provinsi_tb.findAll(); 
        res.render('addkabupaten', { provinsi: provinsiList });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Kesalahan saat memuat data provinsi.');
        res.redirect('/');
    }
});

app.post('/kabupaten/add', upload.single('photo'), async (req, res) => {
    if (!req.session.user_id) {
        req.flash('error_msg', 'Anda perlu login untuk menambahkan kabupaten.');
        return res.redirect('/login');
    }

    const { nama, diresmikan, provinsi_id } = req.body;
    const photo = req.file ? req.file.filename : null; 

    try {
        await kabupaten_tb.create({
            nama,
            diresmikan,
            photo,
            provinsi_id,
        });
        req.flash('success_msg', 'Kabupaten berhasil ditambahkan.');
        res.redirect(`/provinsi/${provinsi_id}`);
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Kesalahan saat menambahkan kabupaten.');
        res.redirect('/kabupaten/add');
    }
});

// Detail provinsi
app.get('/provinsi/:id', async (req, res) => {
    try {
        const provinsi = await provinsi_tb.findByPk(req.params.id, {
            include: [{ model: kabupaten_tb, as: 'kabupaten' }]
        });
        if (!provinsi) {
            req.flash('error_msg', 'Provinsi tidak ditemukan.');
            return res.redirect('/');
        }
        res.render('detail', { provinsi });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Kesalahan saat mengambil detail provinsi.');
        res.redirect('/');
    }
});

// Edit provinsi
app.get('/provinsi/edit/:id', async (req, res) => {
    if (!req.session.user_id) {
        req.flash('error_msg', 'Anda perlu login untuk mengedit provinsi.');
        return res.redirect('/login');
    }

    try {
        const provinsi = await provinsi_tb.findByPk(req.params.id);
        if (!provinsi) {
            req.flash('error_msg', 'Provinsi tidak ditemukan.');
            return res.redirect('/');
        }
        res.render('editProv', { provinsi });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Kesalahan saat mengambil provinsi.');
        res.redirect('/');
    }
});
app.post('/provinsi/edit/:id', upload.single('photo'), async (req, res) => {
    if (!req.session.user_id) {
        req.flash('error_msg', 'Anda perlu login untuk mengedit provinsi.');
        return res.redirect('/login');
    }

    const { nama, diresmikan, pulau } = req.body;
    let photo;

    try {
        const provinsi = await provinsi_tb.findOne({ where: { id: req.params.id } });

        if (!provinsi) {
            req.flash('error_msg', 'Provinsi tidak ditemukan.');
            return res.redirect(`/provinsi/edit/${req.params.id}`);
        }
        if (req.file) {
            photo = req.file.filename;
        } else {
            photo = provinsi.photo; 
        }

        await provinsi_tb.update({
            nama,
            diresmikan,
            photo,
            pulau,
        }, {
            where: { id: req.params.id }
        });

        req.flash('success_msg', 'Provinsi berhasil diperbarui.');
        res.redirect("/");
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Kesalahan saat memperbarui provinsi.');
        res.redirect(`/provinsi/edit/${req.params.id}`);
    }
});

// Edit kabupaten
app.get('/kabupaten/edit/:id', async (req, res) => {
    if (!req.session.user_id) {
        req.flash('error_msg', 'Anda perlu login untuk mengedit kabupaten.');
        return res.redirect('/login');
    }

    try {
        const kabupaten = await kabupaten_tb.findOne({ where: { id: req.params.id } });
        if (!kabupaten) {
            req.flash('error_msg', 'Kabupaten tidak ditemukan.');
            return res.redirect('/provinsi');
        }

        const provinsiList = await provinsi_tb.findAll(); 

        res.render('editkab', { kabupaten, provinsiList });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Kesalahan saat memuat data kabupaten.');
        res.redirect('/provinsi');
    }
});

app.post('/kabupaten/edit/:id', upload.single('photo'), async (req, res) => {
    if (!req.session.user_id) {
        req.flash('error_msg', 'Anda perlu login untuk mengedit kabupaten.');
        return res.redirect('/login');
    }

    const { nama, diresmikan, provinsi_id } = req.body;
    const photo = req.file ? req.file.filename : req.body.existingPhoto; // Gunakan foto yang ada jika tidak diupload

    try {
        const updateResult = await kabupaten_tb.update({
            nama,
            diresmikan,
            photo,
            provinsi_id,
        }, {
            where: { id: req.params.id }
        });

        if (updateResult[0] === 0) {
            req.flash('error_msg', 'Tidak ada perubahan yang dibuat atau kabupaten tidak ditemukan.');
        } else {
            req.flash('success_msg', 'Kabupaten berhasil diperbarui.');
        }
        
        res.redirect(`/provinsi/${provinsi_id}`);
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Kesalahan saat memperbarui kabupaten.');
        res.redirect(`/kabupaten/edit/${req.params.id}`);
    }
});


// Delete provinsi
app.post('/provinsi/delete/:id', async (req, res) => {
    if (!req.session.user_id) {
        req.flash('error_msg', 'Anda perlu login untuk menghapus provinsi.');
        return res.redirect('/login');
    }

    try {
        await provinsi_tb.destroy({ where: { id: req.params.id } });
        req.flash('success_msg', 'Provinsi berhasil dihapus.');
        res.redirect('/');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Kesalahan saat menghapus provinsi.');
        res.redirect(`/provinsi/${req.params.id}`);
    }
});

// Delete kabupaten
app.delete('/kabupaten/delete/:id', async (req, res) => {
    if (!req.session.user_id) {
        req.flash('error_msg', 'Anda perlu login untuk menghapus kabupaten.');
        return res.redirect('/login');
    }
    try {
        const kabupaten = await kabupaten_tb.findByPk(req.params.id);
        if (!kabupaten) {
            req.flash('error_msg', 'Kabupaten tidak ditemukan.');
            return res.redirect('/');
        }
        const provinsi_id = kabupaten.provinsi_id;
        await kabupaten_tb.destroy({ where: { id: req.params.id } });
        req.flash('success_msg', 'Kabupaten berhasil dihapus.');
        res.redirect(`/provinsi/${provinsi_id}`); 
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Kesalahan saat menghapus kabupaten.');
        res.redirect(`/provinsi/${req.body.provinsi_id}`); 
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
