require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// ✅ MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/edusphere';
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("DB Connected ✅"))
  .catch((err) => console.log("DB Error ❌", err));

// ✅ User Schema
const User = mongoose.model('User', new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, default: 'student' },
  attendancePercentage: { type: Number, default: 92 },
  overallGrade: { type: String, default: 'A-' },
  badgesEarned: { type: Number, default: 12 }
}));

// ✅ Dashboard Schemas
const Class = mongoose.model('Class', new mongoose.Schema({
  subject: String,
  time: String,
  teacher: String,
  room: String,
  userEmail: String
}));

const Grade = mongoose.model('Grade', new mongoose.Schema({
  subject: String,
  grade: String,
  percentage: Number,
  date: String,
  userEmail: String
}));

const Assignment = mongoose.model('Assignment', new mongoose.Schema({
  id: String,
  courseId: String,
  courseName: String,
  teacherId: String,
  title: String,
  description: String,
  dueDate: String,
  createdDate: String,
  maxMarks: Number,
  submittedStatus: String,
  userEmail: String
}));

// ✅ Notification Schema
const Notification = mongoose.model('Notification', new mongoose.Schema({
  text: String,
  createdAt: { type: Date, default: Date.now }
}));

// ✅ Signup API
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ name, email, password: hashedPassword, role: 'student' });
    await user.save();
    res.json({ message: 'Signup Success ✅' });
  } catch (err) {
    res.status(500).json({ message: 'Error in signup ❌' });
  }
});

// ✅ Login API
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid Credentials ❌' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid Credentials ❌' });
    }

    res.json({ message: 'Login Success ✅', user: { name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Login Error ❌' });
  }
});

// ✅ TEMP: Add test user
app.get('/add', async (req, res) => {
  try {
    const user = new User({
      name: "Test User",
      email: "test@gmail.com",
      password: "1234"
    });

    await user.save();
    res.send("User Added ✅");
  } catch (err) {
    res.send("Error adding user ❌");
  }
});

// ✅ Get Notifications
app.get('/api/notifications', async (req, res) => {
  const data = await Notification.find().sort({ createdAt: -1 });
  res.json(data);
});

// ✅ Create Notification
app.post('/api/notifications', async (req, res) => {
  const n = new Notification(req.body);
  await n.save();
  res.json({ message: 'Notification Created ✅' });
});

// ✅ Get Dashboard Data
app.get('/api/dashboard/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const classes = await Class.find({ userEmail: email });
    const grades = await Grade.find({ userEmail: email });
    const assignments = await Assignment.find({ userEmail: email });

    res.json({
      userStats: {
        attendancePercentage: user.attendancePercentage,
        overallGrade: user.overallGrade,
        badgesEarned: user.badgesEarned
      },
      classes,
      grades,
      assignments
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching dashboard data" });
  }
});

// ✅ Seed Database
app.post('/api/seed', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    await Class.deleteMany({ userEmail: email });
    await Grade.deleteMany({ userEmail: email });
    await Assignment.deleteMany({ userEmail: email });

    await Class.insertMany([
      { subject: "Mathematics", time: "09:00 AM", teacher: "Dr. Smith", room: "Room 301", userEmail: email },
      { subject: "Physics", time: "11:00 AM", teacher: "Prof. Johnson", room: "Lab 2", userEmail: email },
      { subject: "Computer Science", time: "02:00 PM", teacher: "Ms. Williams", room: "Room 205", userEmail: email }
    ]);

    await Grade.insertMany([
      { subject: "Mathematics", grade: "A", percentage: 95, date: "2024-01-15", userEmail: email },
      { subject: "Physics", grade: "A-", percentage: 88, date: "2024-01-14", userEmail: email },
      { subject: "Chemistry", grade: "B+", percentage: 85, date: "2024-01-13", userEmail: email }
    ]);

    await Assignment.insertMany([
      {
        id: "assign1", courseName: "Mathematics 101", title: "Calculus Problem Set",
        dueDate: "2024-01-25", submittedStatus: "pending", userEmail: email
      },
      {
        id: "assign2", courseName: "Physics 101", title: "Lab Report - Newton's Laws",
        dueDate: "2024-01-27", submittedStatus: "submitted", userEmail: email
      }
    ]);

    res.json({ message: 'Database Seeded Successfully! ✅' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Seeding Error" });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
