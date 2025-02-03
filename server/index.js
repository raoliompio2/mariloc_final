const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// Caminho do arquivo de configurações
const SETTINGS_FILE = 'settings.json';

// Configurações padrão
const defaultSettings = {
  lightHeaderColor: '#ffffff',
  lightHeaderTextColor: '#1e293b',
  lightFooterColor: '#f8fafc',
  lightFooterTextColor: '#1e293b',
  darkHeaderColor: '#001a41',
  darkHeaderTextColor: '#e2e8f0',
  darkFooterColor: '#001a41',
  darkFooterTextColor: '#e2e8f0',
  lightHeaderLogoUrl: '',
  darkHeaderLogoUrl: '',
  lightFooterLogoUrl: '',
  darkFooterLogoUrl: '',
};

// Função para ler as configurações
async function readSettings() {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Se o arquivo não existir, cria com as configurações padrão
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(defaultSettings));
    return defaultSettings;
  }
}

// Função para salvar as configurações
async function saveSettings(settings) {
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings));
}

// Rotas
app.get('/api/system-settings', async (req, res) => {
  try {
    const settings = await readSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao ler configurações' });
  }
});

app.put('/api/system-settings', async (req, res) => {
  try {
    const currentSettings = await readSettings();
    const newSettings = { ...currentSettings, ...req.body };
    await saveSettings(newSettings);
    res.json(newSettings);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao salvar configurações' });
  }
});

app.post('/api/system-settings/logo', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const fileUrl = `http://localhost:${port}/uploads/${req.file.filename}`;
    const type = req.body.type;

    const settings = await readSettings();
    settings[`${type}LogoUrl`] = fileUrl;
    await saveSettings(settings);

    res.json({ url: fileUrl });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer upload do logo' });
  }
});

// Criar pasta uploads se não existir
async function init() {
  try {
    await fs.mkdir('uploads', { recursive: true });
  } catch (error) {
    console.error('Erro ao criar pasta uploads:', error);
  }
}

init().then(() => {
  app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });
});
