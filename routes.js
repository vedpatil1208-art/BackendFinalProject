const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Gig, Job, Message } = require('./models');
const { SECRET, admin, need, protect, only } = require('./middleware');

const sign = (id) => jwt.sign({ id }, SECRET, { expiresIn: '7d' });
const sendUser = (user) => ({ token: sign(user._id), user: { id: user._id, name: user.name, email: user.email, role: user.role } });

router.post('/auth/register', need('name', 'email', 'password'), async (req, res) => {
  const { name, email, password, role } = req.body;

  if (await User.findOne({ email })) {
    return res.status(400).json({ message: 'Email already used' });
  }

  try {
    const { getAuth } = require('firebase-admin/auth');

    const firebaseUser = await getAuth().createUser({
      email,
      password,
      displayName: name
    });

    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role
    });

    res.status(201).json({
      message: 'User registered in Firebase and MongoDB',
      firebaseUid: firebaseUser.uid,
      ...sendUser(user)
    });

  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

router.post('/auth/login', need('email', 'password'), async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) return res.status(401).json({ message: 'Invalid credentials' });
  res.json(sendUser(user));
});

router.post('/auth/firebase', need('idToken'), async (req, res) => {
  if (!admin) return res.status(500).json({ message: 'Firebase not configured' });
  const { getAuth } = require('firebase-admin/auth');
  const decoded = await getAuth().verifyIdToken(req.body.idToken);
  let user = await User.findOne({ email: decoded.email });
  if (!user) user = await User.create({
    name: decoded.name || decoded.email,
    email: decoded.email,
    password: await bcrypt.hash(decoded.uid, 10),
    role: req.body.role || 'client'
  });
  res.json(sendUser(user));
});

router.get('/gigs/search', async (req, res) => {
  const keyword = req.query.keyword;
  if (!keyword) return res.status(400).json({ message: 'keyword required' });
  const rx = new RegExp(keyword.replace(/-/g, '[- ]'), 'i');
  res.json(await Gig.find({ $or: [{ title: rx }, { description: rx }, { category: rx }] }));
});

router.get('/gigs', async (req, res) => {
  res.json(await Gig.find().populate('freelancer', 'name'));
});

router.get('/gigs/:id', async (req, res) => {
  const gig = await Gig.findById(req.params.id).populate('freelancer', 'name');
  if (!gig) return res.status(404).json({ message: 'Gig not found' });
  res.json(gig);
});

router.post('/gigs', protect, only('freelancer'), need('title', 'description', 'category', 'price'), async (req, res) => {
  const { title, description, category, price, image } = req.body;
  const gig = await Gig.create({ title, description, category, price, image, freelancer: req.user._id });
  res.status(201).json(gig);
});

router.put('/gigs/:id', protect, only('freelancer'), async (req, res) => {
  const gig = await Gig.findById(req.params.id);
  if (!gig) return res.status(404).json({ message: 'Gig not found' });
  if (gig.freelancer.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not your gig' });
  Object.assign(gig, req.body);
  await gig.save();
  res.json(gig);
});

router.delete('/gigs/:id', protect, only('freelancer'), async (req, res) => {
  const gig = await Gig.findById(req.params.id);
  if (!gig) return res.status(404).json({ message: 'Gig not found' });
  if (gig.freelancer.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not your gig' });
  await gig.deleteOne();
  res.json({ message: 'Gig deleted' });
});

router.post('/jobs', protect, only('client'), need('title', 'description', 'budget'), async (req, res) => {
  res.status(201).json(await Job.create({ ...req.body, client: req.user._id }));
});

router.get('/jobs', protect, async (req, res) => {
  res.json(await Job.find().populate('client', 'name'));
});

router.post('/jobs/:id/apply', protect, only('freelancer'), need('proposal'), async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found' });
  if (job.applicants.some(a => a.freelancer.toString() === req.user._id.toString())) return res.status(400).json({ message: 'Already applied' });
  job.applicants.push({ freelancer: req.user._id, proposal: req.body.proposal });
  await job.save();
  res.json(job);
});

router.post('/messages', protect, need('receiver', 'text'), async (req, res) => {
  const { receiver, text } = req.body;
  const conversationId = [req.user._id.toString(), receiver].sort().join('_');
  const msg = await Message.create({ conversationId, sender: req.user._id, receiver, text });
  req.app.get('io').to(conversationId).emit('newMessage', msg);
  res.status(201).json(msg);
});

router.get('/messages/:conversationId', protect, async (req, res) => {
  const { conversationId } = req.params;
  if (!conversationId.split('_').includes(req.user._id.toString())) return res.status(403).json({ message: 'Forbidden' });
  res.json(await Message.find({ conversationId }).sort('createdAt'));
});

module.exports = router;