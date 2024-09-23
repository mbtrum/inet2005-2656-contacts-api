import express from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';

const router = express.Router();

// Prisma setup
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/'); // save uploaded files in `public/images` folder
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split('.').pop(); // get file extension
    const uniqueFilename = Date.now() + '-' + Math.round(Math.random() * 1000) + '.' + ext; // generate unique filename - current timestamp + random number between 0 and 1000.
    cb(null, uniqueFilename);
  }
});

const upload = multer({ storage: storage });
  

 //
 // Routes
 // 

// Get all contacts
router.get('/all', async (req, res) => {
  const contacts = await prisma.contact.findMany(); 

  res.json(contacts);
});

// Get a contact by id
router.get('/get/:id', async (req, res) => {
  const id = req.params.id;

  // Validate id is a number
  if(isNaN(id)){
    res.status(400).json({ message: 'Invalid contact ID.'});
    return;
  }

  // By ID
  const contact = await prisma.contact.findUnique({
    where: {
      id: parseInt(id),
    },
  });

  if(contact) {
    res.json(contact);
  } 
  else {
    res.status(404).json({ message: 'Contact not found.'});
  }  
});

// Add a new contact (with Multer)
router.post('/create', upload.single('image'), async (req, res) => {
  const filename = req.file ? req.file.filename : null;
  const { firstName, lastName, email, phone, title } = req.body;

  if(!firstName || !lastName || !email || !phone) {
    return res.status(400).json({message: 'Required fields must have a value.'});
  }

  const contact = await prisma.contact.create({
    data: {
      firstName: firstName,
      lastName: lastName,
      email: email,
      phone: phone,
      title: title,
      filename: filename
    },
  });

  res.json(contact);
});

// Update a contact by id (with Multer)
router.put('/update/:id', upload.single('image'), (req, res) => {
  const id = req.params.id;
  res.send('Update by id ' + id);
});

// Delete a contact by id
router.delete('/delete/:id', (req, res) => {
  const id = req.params.id;
  res.send('Delete by id ' + id);
});

export default router;

