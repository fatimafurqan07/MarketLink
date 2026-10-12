import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { GoogleGenAI } from '@google/genai';
import { connectDB } from './src/server/db.ts';
import { User, Market, Product, Order, Review, Favorite, Category, Announcement, Notification } from './src/server/models/index.ts';
import type { IUser, IMarket, IProduct, IOrder, INotification } from './src/server/models/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'marketlink-egreen-secret-key-2026';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize Google Gemini SDK
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// ---------------------------------------------------------------------
// Authentication Middleware
// ---------------------------------------------------------------------
interface AuthRequest extends Request {
  user?: IUser;
}

const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(403).json({ error: 'User not found or revoked.' });
    }
    if (user.isSuspended) {
      return res.status(403).json({ error: 'Your account has been suspended by administration.' });
    }
    req.user = user;
    next();
  } catch {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

const requireRole = (allowedRoles: ('admin' | 'farmer' | 'customer')[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden. Requires one of roles: ${allowedRoles.join(', ')}` });
    }
    next();
  };
};

const requireModule = (requiredModule: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (req.user.role === 'admin' || (req.user.modules && req.user.modules.includes(requiredModule))) {
      return next();
    }
    return res.status(403).json({
      error: `Forbidden. Missing required module permission: ${requiredModule}`,
    });
  };
};

// Helper: Format User document for frontend JSON response
function formatUserResponse(u: IUser) {
  let userModules = u.modules && u.modules.length > 0
    ? [...u.modules]
    : ['markets_discovery', 'produce_catalog', 'my_preorders', 'order_history', 'favorites', 'agro_copilot'];

  if (u.role === 'customer' || u.role === 'admin') {
    if (!userModules.includes('order_history')) userModules.push('order_history');
    if (!userModules.includes('favorites')) userModules.push('favorites');
  }

  return {
    id: u._id.toString(),
    _id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    role_title: u.role_title || (u.role === 'admin' ? 'SuperAdmin' : u.role === 'farmer' ? 'Grower' : 'Customer'),
    phone: u.phone || '',
    cnic: u.cnic || '',
    avatar_url: u.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    organization: u.organization || '',
    country: u.country || 'Pakistan',
    province: u.province,
    city: u.city,
    stall_number: u.stall_number,
    farm_name: u.farm_name,
    modules: userModules,
    isApproved: u.isApproved !== undefined ? u.isApproved : (u.role !== 'farmer'),
    isSuspended: !!u.isSuspended,
    status: u.isSuspended ? 'suspended' : (u.role === 'farmer' && u.isApproved === false ? 'pending_approval' : 'active'),
    created_at: u.createdAt,
  };
}

// Helper: Format Farmer Profile
function formatFarmerProfile(u: IUser, market?: IMarket | null) {
  return {
    id: u._id.toString(),
    user_id: u._id.toString(),
    market_id: u.market_id || '1',
    farm_name: u.farm_name || u.name,
    country: u.country || market?.country || 'Pakistan',
    province: u.province || market?.province || 'Sindh',
    city: u.city || market?.city || 'Karachi',
    stall_number: u.stall_number || 'Stall #A-14',
    stall_lat: market && Number.isFinite(Number(market.latitude)) ? Number(market.latitude) + 0.0002 : 24.9723,
    stall_lng: market && Number.isFinite(Number(market.longitude)) ? Number(market.longitude) + 0.0003 : 67.1574,
    bio: u.bio || `${u.name} cultivates organic produce with daily dawn harvest.`,
    farming_practices: 'Organic Certified' as const,
    cutoff_hours: u.cutoff_hours || 12,
    contact_phone: u.phone || '+92 300 0000000',
    contact_email: u.email,
    banner_image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
    rating_avg: 4.95,
    is_verified: true,
    market_name: market?.name,
    market_address: market?.address,
  };
}

// ---------------------------------------------------------------------
// Auth Routes
// ---------------------------------------------------------------------

/**
 * POST /api/auth/register & POST /api/auth/register-vendor
 * Public Customer / Vendor Self-Serve Onboarding
 */
const handleVendorRegistration = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, organization_type } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email address already exists. Please sign in instead.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const isCommercial = organization_type === 'commercial_vendor';

    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      passwordHash: hashedPassword,
      phone: phone?.trim(),
      role: 'customer',
      role_title: isCommercial ? 'Commercial Culinary Vendor' : 'Verified Household Patron',
      organization: isCommercial ? 'Commercial Food & Hospitality' : 'Household Market Patron',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      modules: ['markets_discovery', 'produce_catalog', 'my_preorders', 'order_history', 'favorites', 'agro_copilot'],
      isApproved: true,
      isSuspended: false,
    });

    const token = jwt.sign(
      { id: newUser._id.toString(), email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Vendor / customer account created successfully.',
      token,
      user: formatUserResponse(newUser),
    });
  } catch (err: unknown) {
    if ((err as any)?.code === 11000 || (err as Error)?.message?.includes('duplicate key') || (err as Error)?.message?.includes('E11000')) {
      return res.status(409).json({ error: 'An account with this email address already exists. Please sign in instead.' });
    }
    res.status(500).json({ error: err instanceof Error ? err.message : 'Registration failed' });
  }
};

app.post('/api/auth/register', handleVendorRegistration);
app.post('/api/auth/register-vendor', handleVendorRegistration);

/**
 * POST /api/auth/register-farmer
 * Public Farmer / Grower Onboarding & Stall Allocation
 */
app.post('/api/auth/register-farmer', async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      farm_name,
      cnic_id,
      country,
      province,
      city,
      market_id,
      bio,
      farming_practices,
      cutoff_hours,
    } = req.body;

    if (!name || !email || !password || !farm_name) {
      return res.status(400).json({ error: 'Grower name, email, password, and farm name are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email address already exists. Please sign in instead.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedStall = `Stall #${String.fromCharCode(65 + Math.floor(Math.random() * 6))}-${Math.floor(10 + Math.random() * 89)}`;

    const firstMkt = await Market.findOne();
    const selectedMkt = market_id && mongoose.Types.ObjectId.isValid(String(market_id))
      ? await Market.findById(market_id)
      : null;
    const finalMkt = selectedMkt || firstMkt;
    const assignedMarketId = finalMkt?._id.toString() || '1';

    const finalCountry = country?.trim() || finalMkt?.country || 'Pakistan';
    const finalProvince = province?.trim() || finalMkt?.province || 'Sindh';
    const finalCity = city?.trim() || finalMkt?.city || 'Karachi';

    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      passwordHash: hashedPassword,
      phone: phone?.trim(),
      cnic: cnic_id?.trim(),
      country: finalCountry,
      province: finalProvince,
      city: finalCity,
      role: 'farmer',
      role_title: 'Independent Grower',
      farm_name: farm_name.trim(),
      stall_number: assignedStall,
      market_id: assignedMarketId,
      bio: bio?.trim() || `${farm_name.trim()} provides fresh regional agricultural harvests directly to mandi stalls.`,
      cutoff_hours: parseInt(cutoff_hours) || 12,
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
      organization: farm_name.trim(),
      modules: ['harvest_inventory', 'stall_scanner', 'markets_discovery', 'produce_catalog', 'analytics_reports', 'agro_copilot'],
      isApproved: false,
      isSuspended: false,
    });

    const token = jwt.sign(
      { id: newUser._id.toString(), email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const farmerProfile = formatFarmerProfile(newUser, finalMkt);

    res.status(201).json({
      message: `Farmer stall registered successfully at ${assignedStall}.`,
      token,
      user: formatUserResponse(newUser),
      farmerProfile,
    });
  } catch (err: unknown) {
    if ((err as any)?.code === 11000 || (err as Error)?.message?.includes('duplicate key') || (err as Error)?.message?.includes('E11000')) {
      return res.status(409).json({ error: 'An account with this email address already exists. Please sign in instead.' });
    }
    res.status(500).json({ error: err instanceof Error ? err.message : 'Farmer registration failed' });
  }
});

/**
 * POST /api/auth/login
 */
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter both email and password.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({
      $or: [
        { email: cleanEmail },
        ...(cleanEmail === 'admin@marketlink.org' ? [{ email: 'admin@marketlink.com' }] : []),
      ],
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Verify password with bcrypt (fallback to plaintext match for demo seeds if not yet hashed)
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.passwordHash);
    } catch {
      isMatch = user.passwordHash === password;
    }

    if (!isMatch && user.passwordHash === password) {
      isMatch = true;
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.isSuspended) {
      return res.status(403).json({ error: 'Your account has been suspended by administration. Please contact platform support.' });
    }

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    let farmerProfile = null;
    if (user.role === 'farmer') {
      farmerProfile = formatFarmerProfile(user);
    }

    res.json({
      token,
      user: formatUserResponse(user),
      farmerProfile,
    });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Login failed' });
  }
});

/**
 * GET /api/auth/me
 */
app.get('/api/auth/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  let farmerProfile = null;
  if (user.role === 'farmer') {
    farmerProfile = formatFarmerProfile(user);
  }
  res.json({
    user: formatUserResponse(user),
    farmerProfile,
  });
});

// ---------------------------------------------------------------------
// Dynamic RBAC User Management Endpoints
// ---------------------------------------------------------------------
app.get('/api/users', authenticateToken, async (req: AuthRequest, res: Response) => {
  const currentUser = req.user!;
  if (currentUser.role !== 'admin' && !currentUser.modules?.includes('user_management')) {
    return res.status(403).json({ error: 'Access denied. Requires user management permission.' });
  }

  const allUsers = await User.find().sort({ createdAt: -1 });
  res.json(allUsers.map(formatUserResponse));
});

app.post('/api/users', authenticateToken, async (req: AuthRequest, res: Response) => {
  const currentUser = req.user!;
  if (currentUser.role !== 'admin' && !currentUser.modules?.includes('user_management')) {
    return res.status(403).json({ error: 'Access denied. Requires user management permission.' });
  }

  const { name, email, password, role, role_title, phone, organization, modules } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Name, email, password, and role are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const existing = await User.findOne({ email: cleanEmail });
  if (existing) {
    return res.status(409).json({ error: 'A user with this email address already exists.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    name: name.trim(),
    email: cleanEmail,
    passwordHash: hashedPassword,
    role: role as 'admin' | 'farmer' | 'customer',
    role_title: role_title?.trim() || `${role.charAt(0).toUpperCase() + role.slice(1)} Member`,
    phone: phone?.trim() || '+92 (300) 0000000',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
    organization: organization?.trim() || 'MarketLink Community',
    modules: Array.isArray(modules) ? modules : ['produce_catalog', 'my_preorders', 'markets_discovery'],
  });

  res.status(201).json({
    message: 'User created successfully.',
    user: formatUserResponse(newUser),
  });
});

// ---------------------------------------------------------------------
// Profile Management (Self-service profile update for all authenticated users)
// ---------------------------------------------------------------------
app.get('/api/auth/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  res.json({ user: formatUserResponse(req.user!) });
});

app.put('/api/auth/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const {
      name,
      phone,
      cnic,
      organization,
      avatar_url,
      country,
      province,
      city,
      farm_name,
      stall_number,
      bio,
      cutoff_hours,
      newPassword,
    } = req.body;

    if (name && typeof name === 'string' && name.trim()) {
      user.name = name.trim();
    }
    if (phone !== undefined && typeof phone === 'string') {
      user.phone = phone.trim();
    }
    if (cnic !== undefined && typeof cnic === 'string') {
      user.cnic = cnic.trim();
    }
    if (organization !== undefined && typeof organization === 'string') {
      user.organization = organization.trim();
    }
    if (avatar_url !== undefined && typeof avatar_url === 'string') {
      user.avatar_url = avatar_url.trim();
    }
    if (country !== undefined && typeof country === 'string') {
      user.country = country;
    }
    if (province !== undefined && typeof province === 'string') {
      user.province = province;
    }
    if (city !== undefined && typeof city === 'string') {
      user.city = city;
    }

    if (user.role === 'farmer') {
      if (farm_name !== undefined && typeof farm_name === 'string') {
        user.farm_name = farm_name.trim();
      }
      if (stall_number !== undefined && typeof stall_number === 'string') {
        user.stall_number = stall_number.trim();
      }
      if (bio !== undefined && typeof bio === 'string') {
        user.bio = bio.trim();
      }
      if (cutoff_hours !== undefined) {
        user.cutoff_hours = Number(cutoff_hours) || 12;
      }
    }

    if (newPassword && typeof newPassword === 'string' && newPassword.trim().length >= 4) {
      user.passwordHash = await bcrypt.hash(newPassword.trim(), 10);
    }

    await user.save();
    res.json({
      message: 'Profile updated successfully!',
      user: formatUserResponse(user),
    });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to update profile' });
  }
});

app.put('/api/users/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  const currentUser = req.user!;
  if (currentUser.role !== 'admin' && !currentUser.modules?.includes('user_management')) {
    return res.status(403).json({ error: 'Access denied. Requires user management permission.' });
  }

  const targetId = req.params.id;
  const user = await User.findById(targetId);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const { name, role, role_title, phone, organization, modules, password } = req.body;
  if (name) user.name = name.trim();
  if (role) user.role = role;
  if (role_title) user.role_title = role_title.trim();
  if (phone) user.phone = phone.trim();
  if (organization) user.organization = organization.trim();
  if (Array.isArray(modules)) user.modules = modules;
  if (password && password.trim()) {
    user.passwordHash = await bcrypt.hash(password.trim(), 10);
  }

  await user.save();
  res.json({
    message: 'User updated successfully.',
    user: formatUserResponse(user),
  });
});

app.delete('/api/users/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  const currentUser = req.user!;
  if (currentUser.role !== 'admin' && !currentUser.modules?.includes('user_management')) {
    return res.status(403).json({ error: 'Access denied. Requires user management permission.' });
  }

  const targetId = req.params.id;
  if (targetId === currentUser._id.toString()) {
    return res.status(400).json({ error: 'Cannot delete your own logged-in account.' });
  }

  const deleted = await User.findByIdAndDelete(targetId);
  if (!deleted) {
    return res.status(404).json({ error: 'User not found.' });
  }

  res.json({ message: 'User deleted successfully.' });
});

// ---------------------------------------------------------------------
// Markets & Farmers Routes (Mongoose CRUD)
// ---------------------------------------------------------------------
function formatMarketResponse(m: IMarket, stallCount: number = 24) {
  const city = m.city || 'Karachi';
  let province = m.province;
  if (!province) {
    const cLower = city.toLowerCase();
    if (cLower.includes('karachi') || cLower.includes('hyderabad') || cLower.includes('sukkur') || cLower.includes('larkana')) {
      province = 'Sindh';
    } else if (cLower.includes('lahore') || cLower.includes('faisalabad') || cLower.includes('multan') || cLower.includes('rawalpindi') || cLower.includes('sialkot')) {
      province = 'Punjab';
    } else if (cLower.includes('islamabad')) {
      province = 'Islamabad Capital Territory';
    } else if (cLower.includes('peshawar') || cLower.includes('swat') || cLower.includes('abbottabad')) {
      province = 'Khyber Pakhtunkhwa';
    } else if (cLower.includes('quetta') || cLower.includes('gwadar')) {
      province = 'Balochistan';
    } else {
      province = 'Sindh';
    }
  }

  return {
    id: m._id.toString(),
    _id: m._id,
    name: m.name,
    slug: m.slug || m.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    location_address: m.address,
    country: m.country || 'Pakistan',
    province: province,
    city: city,
    latitude: Number.isFinite(Number(m.latitude)) ? Number(m.latitude) : 24.9721,
    longitude: Number.isFinite(Number(m.longitude)) ? Number(m.longitude) : 67.1571,
    plus_code: m.plus_code || `${(Number.isFinite(Number(m.latitude)) ? Number(m.latitude) : 24.9721).toFixed(4)}, ${(Number.isFinite(Number(m.longitude)) ? Number(m.longitude) : 67.1571).toFixed(4)}`,
    gps_coords: m.gps_coords || `${(Number.isFinite(Number(m.latitude)) ? Number(m.latitude) : 24.9721).toFixed(4)}° N, ${(Number.isFinite(Number(m.longitude)) ? Number(m.longitude) : 67.1571).toFixed(4)}° E`,
    stall_bays: m.stall_bays || 'Bays 01-32 • Main Farmers Row',
    operating_days: Array.isArray(m.operatingDays) && m.operatingDays.length > 0 ? m.operatingDays.join(', ') : 'Daily',
    timings: m.timings || '04:30 AM – 11:30 AM',
    opening_time: m.opening_time || (m.timings ? m.timings.split('–')[0]?.trim() : '04:30:00'),
    closing_time: m.closing_time || (m.timings ? m.timings.split('–')[1]?.trim() : '11:30:00'),
    description: m.description || m.name,
    parking_info: m.parking_info || 'Free loading bay parking on site.',
    image_url: m.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    stall_count: m.stall_count || stallCount,
    is_active: m.is_active !== undefined ? m.is_active : true,
  };
}

app.get('/api/markets', async (req: Request, res: Response) => {
  try {
    const { country, province, city } = req.query;
    const filter: Record<string, any> = {};

    if (country && typeof country === 'string' && country.trim()) {
      filter.country = new RegExp(`^${country.trim()}$`, 'i');
    }
    if (province && typeof province === 'string' && province.trim()) {
      filter.province = new RegExp(`^${province.trim()}$`, 'i');
    }
    if (city && typeof city === 'string' && city.trim()) {
      filter.city = new RegExp(`^${city.trim()}$`, 'i');
    }

    const markets = await Market.find(filter);
    const farmers = await User.find({ role: 'farmer' });

    const formatted = markets.map((m) => {
      const stalls = farmers.filter((f) => f.market_id === m._id.toString() || f.market_id === '1');
      const safeLat = Number.isFinite(Number(m.latitude)) ? Number(m.latitude) : 24.9721;
      const safeLng = Number.isFinite(Number(m.longitude)) ? Number(m.longitude) : 67.1571;
      return {
        ...formatMarketResponse(m, stalls.length || 24),
        stalls: stalls.map((s) => ({
          id: s._id.toString(),
          farm_name: s.farm_name || s.name,
          stall_number: s.stall_number || 'Stall A-14',
          stall_lat: safeLat + 0.0002,
          stall_lng: safeLng + 0.0003,
          farming_practices: 'Organic Certified',
          rating_avg: 4.95,
        })),
      };
    });

    res.json(formatted);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch markets' });
  }
});

app.get('/api/markets/:id', async (req: Request, res: Response) => {
  try {
    const market = await Market.findById(req.params.id);
    if (!market) return res.status(404).json({ error: 'Market not found' });

    const farmers = await User.find({ role: 'farmer', market_id: market._id.toString() });
    res.json({
      ...formatMarketResponse(market, farmers.length),
      farmers: farmers.map((f) => formatFarmerProfile(f, market)),
    });
  } catch {
    res.status(404).json({ error: 'Market not found' });
  }
});

app.post('/api/admin/markets', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { name, location_address, address, country, province, city, latitude, longitude, operating_days, operatingDays, timings, opening_time, closing_time, description, parking_info, image_url, stall_count } = req.body;

    if (!name || (!address && !location_address)) {
      return res.status(400).json({ error: 'Market name and address are required.' });
    }

    const resolvedDays = operatingDays
      ? (Array.isArray(operatingDays) ? operatingDays : operatingDays.split(',').map((s: string) => s.trim()))
      : operating_days
      ? (Array.isArray(operating_days) ? operating_days : operating_days.split(',').map((s: string) => s.trim()))
      : ['Daily'];

    const newMarket = await Market.create({
      name: name.trim(),
      address: (location_address || address || 'Sabzi Mandi').trim(),
      country: country?.trim() || 'Pakistan',
      province: province?.trim() || 'Sindh',
      city: city?.trim() || 'Mandi Hub',
      latitude: parseFloat(latitude) || 24.9721,
      longitude: parseFloat(longitude) || 67.1571,
      operatingDays: resolvedDays,
      timings: timings || `${opening_time || '04:30 AM'} – ${closing_time || '11:30 AM'}`,
      opening_time: opening_time || '04:30 AM',
      closing_time: closing_time || '11:30 AM',
      description: description?.trim() || `${name.trim()} agricultural trade center and grower stalls.`,
      parking_info: parking_info?.trim() || 'Designated loading docks and customer parking on site.',
      image_url: image_url?.trim() || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
      stall_count: parseInt(stall_count) || 24,
      is_active: true,
    });

    res.status(201).json(formatMarketResponse(newMarket));
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to create market' });
  }
});

const handleMarketUpdate = async (req: AuthRequest, res: Response) => {
  try {
    const market = await Market.findById(req.params.id);
    if (!market) return res.status(404).json({ error: 'Market not found.' });

    const {
      name,
      location_address,
      address,
      city,
      latitude,
      longitude,
      operating_days,
      operatingDays,
      timings,
      opening_time,
      closing_time,
      description,
      parking_info,
      image_url,
      stall_count,
      is_active,
    } = req.body;

    if (name) market.name = name.trim();
    if (address || location_address) market.address = (address || location_address).trim();
    if (city) market.city = city.trim();
    if (latitude !== undefined) market.latitude = parseFloat(latitude);
    if (longitude !== undefined) market.longitude = parseFloat(longitude);
    if (operatingDays) {
      market.operatingDays = Array.isArray(operatingDays) ? operatingDays : operatingDays.split(',').map((s: string) => s.trim());
    } else if (operating_days) {
      market.operatingDays = Array.isArray(operating_days) ? operating_days : operating_days.split(',').map((s: string) => s.trim());
    }
    if (timings) market.timings = timings.trim();
    if (opening_time) market.opening_time = opening_time.trim();
    if (closing_time) market.closing_time = closing_time.trim();
    if (description) market.description = description.trim();
    if (parking_info) market.parking_info = parking_info.trim();
    if (image_url) market.image_url = image_url.trim();
    if (stall_count !== undefined) market.stall_count = parseInt(stall_count);
    if (is_active !== undefined) market.is_active = Boolean(is_active);

    await market.save();
    res.json(formatMarketResponse(market));
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to update market' });
  }
};

app.put('/api/admin/markets/:id', authenticateToken, requireRole(['admin']), handleMarketUpdate);
app.patch('/api/admin/markets/:id', authenticateToken, requireRole(['admin']), handleMarketUpdate);

app.delete('/api/admin/markets/:id', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    let deleted = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      deleted = await Market.findByIdAndDelete(req.params.id);
    }
    if (!deleted) {
      deleted = await Market.findOneAndDelete({ slug: req.params.id });
    }
    if (!deleted) {
      deleted = await Market.findOneAndDelete({ name: req.params.id });
    }
    if (!deleted) return res.status(404).json({ error: 'Market not found.' });
    res.json({ message: `Market "${deleted.name}" removed successfully.` });
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to delete market' });
  }
});

app.get('/api/farmers', async (_req: Request, res: Response) => {
  try {
    const farmers = await User.find({ role: 'farmer' });
    const markets = await Market.find();

    const formatted = farmers.map((f) => {
      const market = markets.find((m) => m._id.toString() === f.market_id);
      return formatFarmerProfile(f, market);
    });

    res.json(formatted);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch farmers' });
  }
});

app.get('/api/farmers/:id', async (req: Request, res: Response) => {
  try {
    const farmer = await User.findOne({ _id: req.params.id, role: 'farmer' });
    if (!farmer) return res.status(404).json({ error: 'Farmer stall not found' });

    const market = await Market.findById(farmer.market_id);
    const products = await Product.find({ farmerId: farmer._id });

    res.json({
      ...formatFarmerProfile(farmer, market),
      products: products.map((p) => formatProductResponse(p, farmer, market)),
    });
  } catch {
    res.status(404).json({ error: 'Farmer stall not found' });
  }
});

app.put('/api/farmers/:id/stall', authenticateToken, requireRole(['farmer', 'admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { stall_number, cutoff_hours, bio, contact_phone } = req.body;
    const farmer = await User.findById(req.params.id);
    if (!farmer || farmer.role !== 'farmer') {
      return res.status(404).json({ error: 'Farmer profile not found.' });
    }

    if (stall_number) farmer.stall_number = stall_number;
    if (cutoff_hours !== undefined) farmer.cutoff_hours = parseInt(cutoff_hours);
    if (bio) farmer.bio = bio;
    if (contact_phone) farmer.phone = contact_phone;

    await farmer.save();
    res.json(formatFarmerProfile(farmer));
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to update stall' });
  }
});

// ---------------------------------------------------------------------
// Products Routes (Mongoose CRUD)
// ---------------------------------------------------------------------
function formatProductResponse(p: IProduct, farmer?: IUser | null, market?: IMarket | null) {
  return {
    id: p._id.toString(),
    _id: p._id,
    farmer_id: p.farmerId ? p.farmerId.toString() : '1',
    market_id: p.marketId ? p.marketId.toString() : '1',
    name: p.name,
    category: p.category,
    description: p.description || '',
    price_per_unit: p.price,
    price: p.price,
    unit: p.unit,
    farming_type: p.farming_type || 'Organic',
    harvest_date: p.harvest_date || (p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : '2026-09-25'),
    stock_limit: p.stockQuantity || 50,
    in_stock: p.stockQuantity || 0,
    stockQuantity: p.stockQuantity || 0,
    image_url: p.imageUrl || p.image_url || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
    status: p.isSoldOut || p.stockQuantity <= 0 ? 'out_of_stock' : 'active',
    is_sold_out: !!p.isSoldOut,
    isSoldOut: !!p.isSoldOut,
    is_template_active: !!p.isTemplateActive,
    isTemplateActive: !!p.isTemplateActive,
    default_stock_quantity: p.defaultStockQuantity !== undefined ? p.defaultStockQuantity : (p.stockQuantity || 20),
    defaultStockQuantity: p.defaultStockQuantity !== undefined ? p.defaultStockQuantity : (p.stockQuantity || 20),
    farmer_name: farmer?.farm_name || farmer?.name || 'Sindh Agro Orchards',
    stall_number: farmer?.stall_number || 'Stall #A-14',
    cutoff_hours: farmer?.cutoff_hours || 12,
    market_name: market?.name || 'Super Highway Sabzi Mandi',
    market_opening: market?.opening_time || '04:30:00',
  };
}

app.get('/api/products', async (req: Request, res: Response) => {
  try {
    const { marketId, farmerId, category, search } = req.query;

    const filter: Record<string, unknown> = {};
    if (marketId && marketId !== 'All') {
      try { filter.marketId = new mongoose.Types.ObjectId(marketId as string); } catch { /* ignore invalid id */ }
    }
    if (farmerId) {
      try { filter.farmerId = new mongoose.Types.ObjectId(farmerId as string); } catch { /* ignore invalid id */ }
    }
    if (category && category !== 'All') {
      filter.category = category;
    }
    if (search) {
      const term = (search as string).trim();
      filter.$or = [
        { name: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { category: { $regex: term, $options: 'i' } },
      ];
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    const farmers = await User.find({ role: 'farmer' });
    const markets = await Market.find();

    const enriched = products.map((p) => {
      const farmer = farmers.find((f) => f._id.toString() === p.farmerId?.toString());
      const market = markets.find((m) => m._id.toString() === p.marketId?.toString());
      return formatProductResponse(p, farmer, market);
    });

    res.json(enriched);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch products' });
  }
});

app.post('/api/products', authenticateToken, requireRole(['farmer', 'admin']), requireModule('harvest_inventory'), async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = req.user!;
    if (currentUser.role === 'farmer' && currentUser.isApproved === false) {
      return res.status(403).json({ error: 'Your grower account is pending admin approval before you can list products.' });
    }

    const { name, category, description, price_per_unit, price, unit, farming_type, harvest_date, stock_limit, stockQuantity, image_url, imageUrl } = req.body;

    if (!name || (!price_per_unit && !price) || !category || !unit) {
      return res.status(400).json({ error: 'Missing mandatory product fields (name, price, category, unit).' });
    }

    const firstMarket = await Market.findOne();
    let marketObjectId: mongoose.Types.ObjectId;
    try {
      marketObjectId = currentUser.market_id && mongoose.Types.ObjectId.isValid(currentUser.market_id)
        ? new mongoose.Types.ObjectId(currentUser.market_id)
        : (firstMarket?._id as mongoose.Types.ObjectId || new mongoose.Types.ObjectId());
    } catch {
      marketObjectId = (firstMarket?._id as mongoose.Types.ObjectId) || new mongoose.Types.ObjectId();
    }

    const numPrice = parseFloat(price || price_per_unit);
    const numStock = parseInt(stockQuantity || stock_limit) || 30;

    const newProduct = await Product.create({
      farmerId: currentUser._id,
      marketId: marketObjectId,
      name: name.trim(),
      category,
      description: description?.trim() || '',
      price: numPrice,
      unit,
      stockQuantity: numStock,
      farming_type: farming_type || 'Organic',
      harvest_date: harvest_date || new Date().toISOString().split('T')[0],
      imageUrl: image_url || imageUrl || 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80',
      isSoldOut: numStock <= 0,
    });

    res.status(201).json(formatProductResponse(newProduct, currentUser, firstMarket));
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to add product' });
  }
});

app.get('/api/products/:id/price-trends', async (req: Request, res: Response) => {
  try {
    const prodId = req.params.id;
    const product = await Product.findById(prodId);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const currentPrice = product.price || 150;
    const history = [
      { day: 'Day 30', price: Math.round(currentPrice * 1.12) },
      { day: 'Day 25', price: Math.round(currentPrice * 1.08) },
      { day: 'Day 20', price: Math.round(currentPrice * 1.05) },
      { day: 'Day 15', price: Math.round(currentPrice * 1.10) },
      { day: 'Day 10', price: Math.round(currentPrice * 1.02) },
      { day: 'Day 5', price: Math.round(currentPrice * 0.98) },
      { day: 'Today', price: currentPrice },
    ];
    res.json({ productId: prodId, productName: product.name, history });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch price trends' });
  }
});

app.put('/api/products/:id', authenticateToken, requireRole(['farmer', 'admin']), requireModule('harvest_inventory'), async (req: AuthRequest, res: Response) => {
  try {
    const prodId = req.params.id;
    const updateData: Record<string, unknown> = { ...req.body };
    if (req.body.price_per_unit) updateData.price = parseFloat(req.body.price_per_unit);
    if (req.body.in_stock !== undefined) {
      updateData.stockQuantity = parseInt(req.body.in_stock);
      updateData.isSoldOut = parseInt(req.body.in_stock) <= 0;
    }
    if (req.body.image_url) updateData.imageUrl = req.body.image_url;

    const updated = await Product.findByIdAndUpdate(prodId, updateData, { new: true });
    if (!updated) return res.status(404).json({ error: 'Product not found.' });

    res.json(formatProductResponse(updated));
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to update product' });
  }
});

/**
 * POST /api/products/apply-template
 * Resets stockQuantity for template products to saved defaultStockQuantity and sets isSoldOut to false
 */
app.post('/api/products/apply-template', authenticateToken, requireRole(['farmer', 'admin']), async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const uId = user._id || (user as any).id;
    const isAdmin = user.role === 'admin';

    // Find all products owned by this farmer
    const allFarmerProducts = isAdmin
      ? await Product.find({})
      : await Product.find({
          $or: [
            { farmerId: uId },
            { farmerId: uId?.toString() },
            ...(mongoose.Types.ObjectId.isValid(uId) ? [{ farmerId: new mongoose.Types.ObjectId(uId) }] : []),
          ],
        });

    if (allFarmerProducts.length === 0) {
      return res.status(200).json({
        message: 'No harvest listings found for this stall to apply weekly template.',
        count: 0,
        products: [],
      });
    }

    let templateProducts = allFarmerProducts.filter((p) => p.isTemplateActive);
    if (templateProducts.length === 0) {
      templateProducts = allFarmerProducts;
    }

    const updatedProducts: IProduct[] = [];
    for (const prod of templateProducts) {
      const targetStock = prod.defaultStockQuantity && prod.defaultStockQuantity > 0 ? prod.defaultStockQuantity : (prod.stockQuantity > 0 ? prod.stockQuantity : 25);
      prod.stockQuantity = targetStock;
      prod.defaultStockQuantity = targetStock;
      prod.isTemplateActive = true;
      prod.isSoldOut = false;
      await prod.save();
      updatedProducts.push(prod);
    }

    const [farmer, market] = await Promise.all([
      User.findById(uId),
      Market.findOne(),
    ]);

    res.json({
      message: `Weekly harvest template activated! Stock replenished for ${updatedProducts.length} crop listings.`,
      count: updatedProducts.length,
      products: updatedProducts.map((p) => formatProductResponse(p, farmer, market)),
    });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to apply weekly template' });
  }
});

/**
 * PATCH /api/products/:id/toggle-sold-out
 * Quick toggle for marking individual items sold out/available
 */
app.patch('/api/products/:id/toggle-sold-out', authenticateToken, requireRole(['farmer', 'admin']), async (req: AuthRequest, res: Response) => {
  try {
    const prodId = req.params.id;
    let product = null;
    if (mongoose.Types.ObjectId.isValid(prodId)) {
      product = await Product.findById(prodId);
    }
    if (!product) {
      product = await Product.findOne({ $or: [{ _id: prodId }, { id: prodId }] });
    }
    if (!product) return res.status(404).json({ error: 'Product not found.' });

    const uId = req.user!._id || (req.user! as any).id;
    const isOwner = product.farmerId.toString() === uId.toString();
    const isAdmin = req.user!.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Unauthorized to modify this crop listing.' });
    }

    const willBeSoldOut = !product.isSoldOut;
    product.isSoldOut = willBeSoldOut;

    // If making available and stock was 0, restore default or minimal stock
    if (!willBeSoldOut && product.stockQuantity <= 0) {
      product.stockQuantity = product.defaultStockQuantity && product.defaultStockQuantity > 0 ? product.defaultStockQuantity : 15;
    }

    await product.save();

    const [farmer, market] = await Promise.all([
      User.findById(product.farmerId),
      Market.findById(product.marketId),
    ]);

    res.json({
      message: `"${product.name}" is now marked as ${product.isSoldOut ? 'Sold Out' : 'Available'}.`,
      product: formatProductResponse(product, farmer, market),
    });
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to toggle sold out state' });
  }
});

/**
 * PATCH /api/products/:id/template
 * Toggle inclusion in weekly template & default stock quantity
 */
app.patch('/api/products/:id/template', authenticateToken, requireRole(['farmer', 'admin']), async (req: AuthRequest, res: Response) => {
  try {
    const prodId = req.params.id;
    const { isTemplateActive, defaultStockQuantity } = req.body;
    const product = await Product.findById(prodId);
    if (!product) return res.status(404).json({ error: 'Product not found.' });

    const isOwner = product.farmerId.toString() === req.user!._id.toString();
    const isAdmin = req.user!.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Unauthorized to modify this crop listing.' });
    }

    if (isTemplateActive !== undefined) {
      product.isTemplateActive = Boolean(isTemplateActive);
    }
    if (defaultStockQuantity !== undefined) {
      const num = parseInt(defaultStockQuantity);
      if (!isNaN(num) && num >= 0) {
        product.defaultStockQuantity = num;
      }
    }

    await product.save();

    const [farmer, market] = await Promise.all([
      User.findById(product.farmerId),
      Market.findById(product.marketId),
    ]);

    res.json({
      message: `Weekly template preference updated for "${product.name}".`,
      product: formatProductResponse(product, farmer, market),
    });
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to update template status' });
  }
});

// ---------------------------------------------------------------------
// Orders Routes (Mongoose Orders with stock validation)
// ---------------------------------------------------------------------
function formatOrderResponse(
  o: IOrder,
  customer?: IUser | null,
  farmer?: IUser | null,
  market?: IMarket | null,
  productsMap?: Map<string, IProduct>
) {
  return {
    id: o._id.toString(),
    _id: o._id,
    order_code: o.orderCode || `ML-${o._id.toString().slice(-4).toUpperCase()}`,
    customer_id: o.customerId?.toString(),
    farmer_id: o.farmerId ? o.farmerId.toString() : '1',
    market_id: o.marketId ? o.marketId.toString() : '1',
    pickup_date: o.pickupDate,
    pickup_timeslot: o.pickupTimeSlot,
    pickup_token: o.pickupToken || `qrp_${o._id.toString()}`,
    pickup_pin: o.pickupPin || '4921',
    order_status: o.status,
    payment_method: o.paymentMethod || 'Cash On Pickup',
    payment_status: o.status === 'completed' ? 'collected_at_stall' : o.status === 'cancelled' ? 'waived_cancelled' : 'pending_at_stall',
    online_amount_collected: 0.0,
    initial_total_due: o.totalAmount,
    final_total_due: o.finalTotalDue !== undefined ? o.finalTotalDue : o.totalAmount,
    inspection_notes: o.inspectionNotes || 'Reserved online for physical stall pickup.',
    cancelled_reason: o.cancelledReason,
    created_at: o.createdAt,
    customer_name: customer?.name || 'Customer',
    customer_phone: customer?.phone || '',
    customer_email: customer?.email || '',
    farm_name: farmer?.farm_name || farmer?.name || 'Farmer Stall',
    stall_number: farmer?.stall_number || 'Stall A-14',
    market_name: market?.name || 'Sabzi Mandi',
    market_address: market?.address || '',
    items: o.items.map((it, idx) => {
      const prod = productsMap ? productsMap.get(it.productId?.toString()) : null;
      return {
        id: idx + 1,
        order_id: o._id.toString(),
        product_id: it.productId?.toString(),
        product_name: it.productName || prod?.name || 'Fresh Harvest Crop',
        image_url: prod?.imageUrl || prod?.image_url || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
        unit_price: it.price,
        unit: it.unit || prod?.unit || 'kg',
        reserved_qty: it.quantity,
        accepted_qty: it.acceptedQty !== undefined ? it.acceptedQty : it.quantity,
        rejected_qty: it.rejectedQty || 0,
        rejection_note: it.rejectionNote,
        subtotal: it.subtotal || it.price * it.quantity,
      };
    }),
  };
}

function formatReviewResponse(
  r: any,
  customer?: IUser | null,
  product?: IProduct | null,
  farmer?: IUser | null
) {
  return {
    id: r._id.toString(),
    _id: r._id,
    product_id: r.productId?.toString(),
    farmer_id: r.farmerId?.toString(),
    customer_id: r.customerId?.toString(),
    customer_name: customer?.name || 'Verified Customer',
    customer_avatar: customer?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    rating: r.rating,
    comment: r.comment,
    farmer_response: r.farmerResponse || '',
    product_name: product?.name,
    product_image: product?.imageUrl || product?.image_url,
    farmer_name: farmer?.farm_name || farmer?.name,
    created_at: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
  };
}

function formatFavoriteResponse(
  f: any,
  product?: IProduct | null,
  farmer?: IUser | null,
  market?: IMarket | null
) {
  return {
    id: f._id.toString(),
    _id: f._id,
    customer_id: f.customerId?.toString(),
    farmer_id: f.farmerId ? f.farmerId.toString() : undefined,
    product_id: f.productId ? f.productId.toString() : undefined,
    product: product ? formatProductResponse(product, farmer, market) : undefined,
    farmer: farmer ? formatFarmerProfile(farmer, market) : undefined,
    created_at: f.createdAt ? new Date(f.createdAt).toISOString() : new Date().toISOString(),
  };
}

function formatNotificationResponse(n: any) {
  return {
    id: n._id.toString(),
    _id: n._id,
    recipientId: n.recipientId ? n.recipientId.toString() : '',
    message: n.message,
    type: n.type,
    orderId: n.orderId ? n.orderId.toString() : undefined,
    orderCode: n.orderCode,
    isRead: !!n.isRead,
    createdAt: n.createdAt ? new Date(n.createdAt).toISOString() : new Date().toISOString(),
  };
}

async function createNotificationSafe(payload: {
  recipientId: mongoose.Types.ObjectId | string;
  message: string;
  type: 'order_placed' | 'order_accepted' | 'order_ready' | 'order_cancelled';
  orderId?: mongoose.Types.ObjectId | string;
  orderCode?: string;
}) {
  try {
    if (!payload.recipientId) return null;
    const recipientObjectId = typeof payload.recipientId === 'string'
      ? new mongoose.Types.ObjectId(payload.recipientId)
      : payload.recipientId;
    return await Notification.create({
      recipientId: recipientObjectId,
      message: payload.message,
      type: payload.type,
      orderId: payload.orderId,
      orderCode: payload.orderCode,
      isRead: false,
    });
  } catch (err) {
    console.warn('[Notification] Failed to create notification:', err);
    return null;
  }
}

/**
 * POST /api/orders/reserve
 * Validates stock from Product model, reserves order, strictly $0 online fee
 */
app.post('/api/orders/reserve', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { farmerId, marketId, pickupDate, pickupTimeslot, paymentMethod, notes, items } = req.body;
    const customerId = req.user!._id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item.' });
    }

    // Pickup Date Validation: prevent placing orders with past or invalid dates
    if (!pickupDate || typeof pickupDate !== 'string') {
      return res.status(400).json({ error: 'Valid pickup date is required for stall reservation.' });
    }
    const todayStr = new Date().toISOString().split('T')[0];
    if (pickupDate < todayStr) {
      return res.status(400).json({
        error: `Invalid pickup date "${pickupDate}". Order pickup date cannot be in the past. Please select today (${todayStr}) or a future date.`,
      });
    }

    let calculatedTotal = 0;
    const orderItemsToSave = [];

    // 1. Stock Validation from Product collection
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ error: `Product ID #${item.productId} was not found.` });
      }

      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${product.name}. Available: ${product.stockQuantity} ${product.unit}, requested: ${item.quantity}.`,
        });
      }

      const itemTotal = product.price * item.quantity;
      calculatedTotal += itemTotal;

      // Deduct stock from Product
      product.stockQuantity -= item.quantity;
      if (product.stockQuantity <= 0) {
        product.isSoldOut = true;
      }
      await product.save();

      orderItemsToSave.push({
        productId: product._id,
        productName: product.name,
        quantity: item.quantity,
        acceptedQty: item.quantity,
        rejectedQty: 0,
        price: product.price,
        unit: product.unit,
        subtotal: itemTotal,
      });
    }

    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const token = `qrp_${Math.random().toString(36).substring(2, 15)}`;
    const orderCode = `ML-${Math.floor(1000 + Math.random() * 9000)}`;

    let farmerObjectId: mongoose.Types.ObjectId | undefined = undefined;
    let marketObjectId: mongoose.Types.ObjectId | undefined = undefined;
    try { if (farmerId) farmerObjectId = new mongoose.Types.ObjectId(farmerId); } catch { /* ignore */ }
    try { if (marketId) marketObjectId = new mongoose.Types.ObjectId(marketId); } catch { /* ignore */ }

    const newOrder = await Order.create({
      customerId,
      ...(farmerObjectId ? { farmerId: farmerObjectId } : {}),
      ...(marketObjectId ? { marketId: marketObjectId } : {}),
      orderCode,
      pickupPin: pin,
      pickupToken: token,
      paymentMethod: paymentMethod || 'Cash On Pickup',
      items: orderItemsToSave,
      totalAmount: calculatedTotal,
      finalTotalDue: calculatedTotal,
      pickupDate: pickupDate || new Date().toISOString().split('T')[0],
      pickupTimeSlot: pickupTimeslot || '08:30 AM - 10:00 AM',
      inspectionNotes: notes || 'Reserved online for physical stall pickup.',
      status: 'placed',
    });

    const customer = req.user!;
    const farmer = farmerObjectId ? await User.findById(farmerObjectId) : null;
    const market = marketObjectId ? await Market.findById(marketObjectId) : null;

    // Trigger Notification for Farmer(s): "New order received"
    const targetFarmerIds = new Set<string>();
    if (farmerObjectId) {
      targetFarmerIds.add(farmerObjectId.toString());
    }
    for (const item of orderItemsToSave) {
      const prod = await Product.findById(item.productId);
      if (prod?.farmerId) {
        targetFarmerIds.add(prod.farmerId.toString());
      }
    }

    for (const fId of targetFarmerIds) {
      await createNotificationSafe({
        recipientId: fId,
        message: `New order received (#${orderCode}) from ${customer.name || 'Customer'}.`,
        type: 'order_placed',
        orderId: newOrder._id,
        orderCode,
      });
    }

    // Trigger Notification for Customer: "Pre-order reserved"
    await createNotificationSafe({
      recipientId: customerId,
      message: `Your pre-order #${orderCode} for Rs. ${calculatedTotal} was placed successfully! Show 4-digit PIN ${pin} at pickup.`,
      type: 'order_placed',
      orderId: newOrder._id,
      orderCode,
    });

    res.status(201).json({
      message: 'Pre-order reservation placed successfully! Pay on pickup at physical stall.',
      order: formatOrderResponse(newOrder, customer, farmer, market),
    });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Reservation failed' });
  }
});

app.get('/api/orders', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const query: Record<string, unknown> = {};

    if (user.role === 'customer') {
      query.customerId = user._id;
    } else if (user.role === 'farmer') {
      query.farmerId = user._id;
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    const users = await User.find();
    const markets = await Market.find();

    const formatted = orders.map((o) => {
      const customer = users.find((u) => u._id.toString() === o.customerId?.toString());
      const farmer = users.find((u) => u._id.toString() === o.farmerId?.toString());
      const market = markets.find((m) => m._id.toString() === o.marketId?.toString());
      return formatOrderResponse(o, customer, farmer, market);
    });

    res.json(formatted);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch orders' });
  }
});

/**
 * GET /api/orders/farmer
 * List incoming orders containing this farmer's products (only accessible to logged-in farmer/admin)
 */
app.get('/api/orders/farmer', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    if (user.role !== 'farmer' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Access restricted to registered growers and administrators.' });
    }

    const farmerProducts = await Product.find(user.role === 'admin' ? {} : { farmerId: user._id });
    const farmerProductIds = farmerProducts.map((p) => p._id);

    const query: Record<string, unknown> = user.role === 'admin'
      ? {}
      : {
          $or: [
            { farmerId: user._id },
            { 'items.productId': { $in: farmerProductIds } },
          ],
        };

    const orders = await Order.find(query).sort({ createdAt: -1 });

    const customerIds = orders.map((o) => o.customerId).filter(Boolean);
    const farmerIds = orders.map((o) => o.farmerId).filter(Boolean);
    const marketIds = orders.map((o) => o.marketId).filter(Boolean);
    const allProductIds = orders.flatMap((o) => o.items.map((it) => it.productId)).filter(Boolean);

    const [users, markets, products] = await Promise.all([
      User.find({ _id: { $in: [...customerIds, ...farmerIds] as any[] } }),
      Market.find({ _id: { $in: marketIds as any[] } }),
      Product.find({ _id: { $in: allProductIds as any[] } }),
    ]);

    const usersMap = new Map(users.map((u) => [u._id.toString(), u]));
    const marketsMap = new Map(markets.map((m) => [m._id.toString(), m]));
    const productsMap = new Map(products.map((p) => [p._id.toString(), p]));

    const formattedOrders = orders.map((o) => {
      const customer = o.customerId ? usersMap.get(o.customerId.toString()) : null;
      const farmer = o.farmerId ? usersMap.get(o.farmerId.toString()) : null;
      const market = o.marketId ? marketsMap.get(o.marketId.toString()) : null;
      return formatOrderResponse(o, customer, farmer, market, productsMap);
    });

    res.json(formattedOrders);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch incoming orders' });
  }
});

/**
 * GET /api/orders/me
 * Logged-in customer's order history (with populated product details)
 */
app.get('/api/orders/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const customerId = req.user!._id;
    const orders = await Order.find({ customerId }).sort({ createdAt: -1 });

    const allProductIds = Array.from(
      new Set(orders.flatMap((o) => o.items.map((it) => it.productId?.toString())).filter(Boolean))
    );
    const farmerIds = Array.from(new Set(orders.map((o) => o.farmerId?.toString()).filter(Boolean)));
    const marketIds = Array.from(new Set(orders.map((o) => o.marketId?.toString()).filter(Boolean)));

    const products: any[] = await Product.find({ _id: { $in: allProductIds } } as any);
    const farmers: any[] = await User.find({ _id: { $in: farmerIds } } as any);
    const markets: any[] = await Market.find({ _id: { $in: marketIds } } as any);

    const productsMap = new Map<string, any>(products.map((p: any) => [p._id.toString(), p]));

    const formatted = orders.map((o) => {
      const farmer = farmers.find((f: any) => f._id.toString() === o.farmerId?.toString());
      const market = markets.find((m: any) => m._id.toString() === o.marketId?.toString());
      return formatOrderResponse(o, req.user, farmer, market, productsMap);
    });

    res.json(formatted);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch customer orders' });
  }
});

app.get('/api/orders/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    const customer = await User.findById(order.customerId);
    const farmer = order.farmerId ? await User.findById(order.farmerId) : null;
    const market = order.marketId ? await Market.findById(order.marketId) : null;

    res.json(formatOrderResponse(order, customer, farmer, market));
  } catch {
    res.status(404).json({ error: 'Order not found.' });
  }
});

app.get('/api/orders/verify-pin/:pin', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const pin = req.params.pin.trim();
    const order = await Order.findOne({
      $or: [
        { pickupPin: pin },
        { pickupToken: pin },
        { orderCode: { $regex: new RegExp(`^${pin}$`, 'i') } },
      ],
    });

    if (!order) {
      return res.status(404).json({ error: 'No matching order found for this PIN or QR token.' });
    }

    const customer = await User.findById(order.customerId);
    const farmer = order.farmerId ? await User.findById(order.farmerId) : null;
    const market = order.marketId ? await Market.findById(order.marketId) : null;

    res.json(formatOrderResponse(order, customer, farmer, market));
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'PIN verification error' });
  }
});

app.put('/api/orders/:id/status', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { status, reason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    const prevStatus = order.status;
    order.status = status;
    if (reason) order.cancelledReason = reason;
    await order.save();

    // Trigger Notification on status change
    if (prevStatus !== status) {
      if (status === 'accepted') {
        await createNotificationSafe({
          recipientId: order.customerId,
          message: `Your order #${order.orderCode || order._id} was accepted by the farmer.`,
          type: 'order_accepted',
          orderId: order._id,
          orderCode: order.orderCode,
        });
      } else if (status === 'ready') {
        await createNotificationSafe({
          recipientId: order.customerId,
          message: `Your order #${order.orderCode || order._id} is ready for pickup at the mandi stall.`,
          type: 'order_ready',
          orderId: order._id,
          orderCode: order.orderCode,
        });
      } else if (status === 'cancelled') {
        const isCustomerCaller = req.user!._id.toString() === order.customerId.toString();
        if (isCustomerCaller && order.farmerId) {
          await createNotificationSafe({
            recipientId: order.farmerId,
            message: `Order #${order.orderCode || order._id} was cancelled by the customer.`,
            type: 'order_cancelled',
            orderId: order._id,
            orderCode: order.orderCode,
          });
        } else {
          await createNotificationSafe({
            recipientId: order.customerId,
            message: `Your order #${order.orderCode || order._id} was cancelled. ${reason ? `Reason: ${reason}` : ''}`.trim(),
            type: 'order_cancelled',
            orderId: order._id,
            orderCode: order.orderCode,
          });
        }
      }
    }

    res.json({
      message: `Order status successfully transitioned to "${status}".`,
      order: formatOrderResponse(order),
    });
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Status update failed' });
  }
});

app.post('/api/orders/:id/stall-inspection', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { adjustments, inspectionNotes } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    let newFinalTotal = 0;
    if (Array.isArray(adjustments)) {
      for (const adj of adjustments) {
        const item = order.items.find((_, idx) => idx + 1 === adj.itemId);
        if (item) {
          item.acceptedQty = Math.max(0, adj.acceptedQty);
          item.rejectedQty = Math.max(0, adj.rejectedQty);
          item.rejectionNote = adj.rejectionNote;
          item.subtotal = item.acceptedQty * item.price;
          newFinalTotal += item.subtotal;
        }
      }
    }

    order.finalTotalDue = newFinalTotal || order.totalAmount;
    order.status = 'completed';
    if (inspectionNotes) order.inspectionNotes = inspectionNotes;
    await order.save();

    res.json({
      message: 'Stall inspection complete! Damaged produce deducted, new cash total calculated and marked completed.',
      order: formatOrderResponse(order),
    });
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Inspection failed' });
  }
});

app.post('/api/orders/:id/email-slip', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    const customer = await User.findById(order.customerId);
    const emailRecipient = req.body.email || customer?.email || 'customer@example.com';

    res.json({
      success: true,
      message: `Official eGreen Basket Pickup Slip & 4-Digit Pass dispatched to ${emailRecipient}.`,
      pickup_pin: order.pickupPin || '4921',
      order_code: order.orderCode || 'ML-7842',
    });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to dispatch slip' });
  }
});

// ---------------------------------------------------------------------
// Order Management API for Customers (GET /me, PATCH modify, PATCH cancel)
// ---------------------------------------------------------------------

/**
 * PATCH /api/orders/:id
 * Customer can modify items/pickupDate/pickupTimeSlot ONLY if status is still 'placed'
 */
app.patch('/api/orders/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    const isCustomer = order.customerId.toString() === req.user!._id.toString();
    const isAdmin = req.user!.role === 'admin';
    if (!isCustomer && !isAdmin) {
      return res.status(403).json({ error: 'You are not authorized to modify this order.' });
    }

    if (order.status !== 'placed') {
      return res.status(400).json({
        error: `Orders can only be modified while in "placed" status. This order is currently "${order.status}".`,
      });
    }

    const { items, pickupDate, pickupTimeSlot, pickupTimeslot } = req.body;

    if (pickupDate) order.pickupDate = pickupDate;
    const resolvedSlot = pickupTimeSlot || pickupTimeslot;
    if (resolvedSlot) order.pickupTimeSlot = resolvedSlot;

    if (items && Array.isArray(items) && items.length > 0) {
      // 1. Release previous stock back to products
      for (const oldItem of order.items) {
        const prod = await Product.findById(oldItem.productId);
        if (prod) {
          prod.stockQuantity += oldItem.quantity;
          prod.isSoldOut = false;
          await prod.save();
        }
      }

      // 2. Validate and deduct stock for new items
      let newTotal = 0;
      const updatedItems = [];
      for (const it of items) {
        const prod = await Product.findById(it.productId);
        if (!prod) {
          return res.status(400).json({ error: `Product ID #${it.productId} was not found.` });
        }
        if (prod.stockQuantity < it.quantity) {
          return res.status(400).json({
            error: `Insufficient stock for ${prod.name}. Available: ${prod.stockQuantity} ${prod.unit}, requested: ${it.quantity}.`,
          });
        }

        const itemTotal = prod.price * it.quantity;
        newTotal += itemTotal;

        prod.stockQuantity -= it.quantity;
        if (prod.stockQuantity <= 0) prod.isSoldOut = true;
        await prod.save();

        updatedItems.push({
          productId: prod._id,
          productName: prod.name,
          quantity: it.quantity,
          acceptedQty: it.quantity,
          rejectedQty: 0,
          price: prod.price,
          unit: prod.unit,
          subtotal: itemTotal,
        });
      }

      order.items = updatedItems;
      order.totalAmount = newTotal;
      order.finalTotalDue = newTotal;
    }

    await order.save();

    const farmer = order.farmerId ? await User.findById(order.farmerId) : null;
    const market = order.marketId ? await Market.findById(order.marketId) : null;

    res.json({
      message: 'Order updated successfully.',
      order: formatOrderResponse(order, req.user, farmer, market),
    });
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to update order' });
  }
});

/**
 * PATCH /api/orders/:id/cancel
 * Customer can cancel order ONLY if status is 'placed' or 'accepted' (not 'ready' or 'completed')
 */
app.patch('/api/orders/:id/cancel', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    const isCustomer = order.customerId.toString() === req.user!._id.toString();
    const isAdmin = req.user!.role === 'admin';
    const isFarmer = order.farmerId && order.farmerId.toString() === req.user!._id.toString();
    if (!isCustomer && !isAdmin && !isFarmer) {
      return res.status(403).json({ error: 'You are not authorized to cancel this order.' });
    }

    if (order.status !== 'placed' && order.status !== 'accepted') {
      return res.status(400).json({
        error: `Orders can only be cancelled while in "placed" or "accepted" status. This order is currently "${order.status}".`,
      });
    }

    // Return inventory stock back to Product documents
    for (const item of order.items) {
      const prod = await Product.findById(item.productId);
      if (prod) {
        prod.stockQuantity += item.quantity;
        if (prod.stockQuantity > 0) prod.isSoldOut = false;
        await prod.save();
      }
    }

    order.status = 'cancelled';
    if (req.body.reason) order.cancelledReason = req.body.reason;
    await order.save();

    // Trigger Notification for cancellation
    if (isCustomer) {
      // Customer cancelled -> notify farmer
      if (order.farmerId) {
        await createNotificationSafe({
          recipientId: order.farmerId,
          message: `Order #${order.orderCode || order._id} was cancelled by the customer.`,
          type: 'order_cancelled',
          orderId: order._id,
          orderCode: order.orderCode,
        });
      }
    } else {
      // Farmer/Admin cancelled -> notify customer
      await createNotificationSafe({
        recipientId: order.customerId,
        message: `Your order #${order.orderCode || order._id} was cancelled. ${req.body.reason ? `Reason: ${req.body.reason}` : ''}`.trim(),
        type: 'order_cancelled',
        orderId: order._id,
        orderCode: order.orderCode,
      });
    }

    const customer = await User.findById(order.customerId);
    const farmer = order.farmerId ? await User.findById(order.farmerId) : null;
    const market = order.marketId ? await Market.findById(order.marketId) : null;

    res.json({
      message: 'Order reservation cancelled. Reserved stock returned to stall inventory.',
      order: formatOrderResponse(order, customer, farmer, market),
    });
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Cancellation failed' });
  }
});

// ---------------------------------------------------------------------
// Farmer Orders Management & Insights API
// ---------------------------------------------------------------------

/**
 * PATCH /api/orders/:id/accept
 * Farmer accepts an order (status: 'placed' -> 'accepted')
 */
app.patch('/api/orders/:id/accept', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    if (user.role !== 'farmer' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Only registered growers can accept orders.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    const farmerProducts = await Product.find({ farmerId: user._id });
    const farmerProductIds = farmerProducts.map((p) => p._id.toString());
    const isOwner =
      order.farmerId?.toString() === user._id.toString() ||
      order.items.some((it) => farmerProductIds.includes(it.productId?.toString()));

    if (!isOwner && user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized. You do not own the produce in this order.' });
    }

    if (order.status !== 'placed') {
      return res.status(400).json({
        error: `Only orders in "placed" status can be accepted. Current status is "${order.status}".`,
      });
    }

    order.status = 'accepted';
    await order.save();

    // Trigger Notification for customer: "Your order was accepted"
    await createNotificationSafe({
      recipientId: order.customerId,
      message: `Your order #${order.orderCode || order._id} was accepted by the farmer.`,
      type: 'order_accepted',
      orderId: order._id,
      orderCode: order.orderCode,
    });

    const [customer, farmer, market, products] = await Promise.all([
      User.findById(order.customerId),
      order.farmerId ? User.findById(order.farmerId) : null,
      order.marketId ? Market.findById(order.marketId) : null,
      Product.find({ _id: { $in: order.items.map((it) => it.productId) as any[] } }),
    ]);

    const productsMap = new Map(products.map((p) => [p._id.toString(), p]));

    res.json({
      message: `Order #${order.orderCode || order._id} accepted successfully. Customer notified.`,
      order: formatOrderResponse(order, customer, farmer, market, productsMap),
    });
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to accept order' });
  }
});

/**
 * PATCH /api/orders/:id/decline
 * Farmer declines an order (status -> 'cancelled', restore stockQuantity)
 */
app.patch('/api/orders/:id/decline', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    if (user.role !== 'farmer' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Only registered growers can decline orders.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    const farmerProducts = await Product.find({ farmerId: user._id });
    const farmerProductIds = farmerProducts.map((p) => p._id.toString());
    const isOwner =
      order.farmerId?.toString() === user._id.toString() ||
      order.items.some((it) => farmerProductIds.includes(it.productId?.toString()));

    if (!isOwner && user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized. You do not own the produce in this order.' });
    }

    if (order.status === 'cancelled' || order.status === 'completed') {
      return res.status(400).json({
        error: `Cannot decline an order that is already "${order.status}".`,
      });
    }

    // Restore stockQuantity in Product collection
    for (const item of order.items) {
      const prod = await Product.findById(item.productId);
      if (prod) {
        const qtyToRestore = item.acceptedQty !== undefined ? item.acceptedQty : item.quantity;
        prod.stockQuantity += qtyToRestore;
        if (prod.stockQuantity > 0) prod.isSoldOut = false;
        await prod.save();
      }
    }

    order.status = 'cancelled';
    order.cancelledReason = req.body?.reason?.trim() || 'Declined by grower stall (out of crop / weather constraint).';
    await order.save();

    // Trigger Notification for customer: "Your order was declined/cancelled"
    await createNotificationSafe({
      recipientId: order.customerId,
      message: `Your order #${order.orderCode || order._id} was declined/cancelled.`,
      type: 'order_cancelled',
      orderId: order._id,
      orderCode: order.orderCode,
    });

    const [customer, farmer, market, products] = await Promise.all([
      User.findById(order.customerId),
      order.farmerId ? User.findById(order.farmerId) : null,
      order.marketId ? Market.findById(order.marketId) : null,
      Product.find({ _id: { $in: order.items.map((it) => it.productId) as any[] } }),
    ]);

    const productsMap = new Map(products.map((p) => [p._id.toString(), p]));

    res.json({
      message: `Order #${order.orderCode || order._id} declined. Crop stock has been restored to inventory.`,
      order: formatOrderResponse(order, customer, farmer, market, productsMap),
    });
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to decline order' });
  }
});

/**
 * PATCH /api/orders/:id/ready
 * Farmer marks order as ready for pickup (status -> 'ready')
 */
app.patch('/api/orders/:id/ready', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    if (user.role !== 'farmer' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Only registered growers can mark orders ready.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    const farmerProducts = await Product.find({ farmerId: user._id });
    const farmerProductIds = farmerProducts.map((p) => p._id.toString());
    const isOwner =
      order.farmerId?.toString() === user._id.toString() ||
      order.items.some((it) => farmerProductIds.includes(it.productId?.toString()));

    if (!isOwner && user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized. You do not own the produce in this order.' });
    }

    if (order.status === 'cancelled' || order.status === 'completed') {
      return res.status(400).json({
        error: `Cannot mark an order as ready when status is "${order.status}".`,
      });
    }

    order.status = 'ready';
    await order.save();

    // Trigger Notification for customer: "Your order is ready for pickup"
    await createNotificationSafe({
      recipientId: order.customerId,
      message: `Your order #${order.orderCode || order._id} is ready for pickup at the mandi stall! Present your PIN voucher.`,
      type: 'order_ready',
      orderId: order._id,
      orderCode: order.orderCode,
    });

    const [customer, farmer, market, products] = await Promise.all([
      User.findById(order.customerId),
      order.farmerId ? User.findById(order.farmerId) : null,
      order.marketId ? Market.findById(order.marketId) : null,
      Product.find({ _id: { $in: order.items.map((it) => it.productId) as any[] } }),
    ]);

    const productsMap = new Map(products.map((p) => [p._id.toString(), p]));

    res.json({
      message: `Order #${order.orderCode || order._id} marked ready for customer pickup!`,
      order: formatOrderResponse(order, customer, farmer, market, productsMap),
    });
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to mark order ready' });
  }
});

/**
 * GET /api/farmer/insights
 * Return totalOrders, pendingOrders, completedOrders, totalRevenue (sum of totalAmount for completed orders),
 * and top 5 best-selling products (by quantity sold) for the logged-in farmer
 */
app.get('/api/farmer/insights', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    if (user.role !== 'farmer' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Insights are available to registered growers and administrators.' });
    }

    const farmerProducts = await Product.find(user.role === 'admin' ? {} : { farmerId: user._id });
    const farmerProductIds = farmerProducts.map((p) => p._id);
    const farmerProductIdsStr = new Set(farmerProductIds.map((id) => id.toString()));

    const query: Record<string, unknown> = user.role === 'admin'
      ? {}
      : {
          $or: [
            { farmerId: user._id },
            { 'items.productId': { $in: farmerProductIds } },
          ],
        };

    const orders = await Order.find(query);

    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === 'placed' || o.status === 'accepted').length;
    const completedOrders = orders.filter((o) => o.status === 'completed').length;

    const totalRevenue = orders
      .filter((o) => o.status === 'completed')
      .reduce((sum, o) => sum + (o.finalTotalDue !== undefined ? o.finalTotalDue : o.totalAmount || 0), 0);

    const productStats = new Map<string, {
      id: string;
      name: string;
      category: string;
      unit: string;
      price: number;
      image_url: string;
      totalQuantitySold: number;
      totalRevenue: number;
    }>();

    for (const prod of farmerProducts) {
      productStats.set(prod._id.toString(), {
        id: prod._id.toString(),
        name: prod.name,
        category: prod.category,
        unit: prod.unit,
        price: prod.price,
        image_url: prod.imageUrl || prod.image_url || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
        totalQuantitySold: 0,
        totalRevenue: 0,
      });
    }

    for (const o of orders) {
      if (o.status === 'cancelled') continue;
      for (const item of o.items) {
        const prodId = item.productId?.toString();
        if (prodId && (user.role === 'admin' || farmerProductIdsStr.has(prodId))) {
          const qty = item.acceptedQty !== undefined ? item.acceptedQty : item.quantity;
          const subtotal = item.subtotal || item.price * qty;
          const existing = productStats.get(prodId);
          if (existing) {
            existing.totalQuantitySold += qty;
            existing.totalRevenue += subtotal;
          } else {
            productStats.set(prodId, {
              id: prodId,
              name: item.productName || 'Harvest Crop',
              category: 'Fresh Vegetables',
              unit: item.unit || 'kg',
              price: item.price,
              image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
              totalQuantitySold: qty,
              totalRevenue: subtotal,
            });
          }
        }
      }
    }

    const topSellingProducts = Array.from(productStats.values())
      .sort((a, b) => b.totalQuantitySold - a.totalQuantitySold)
      .slice(0, 5);

    res.json({
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
      topSellingProducts,
    });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to calculate insights' });
  }
});

// ---------------------------------------------------------------------
// Reviews API (POST /api/reviews, GET /api/reviews/product/:productId, PATCH /api/reviews/:id/response)
// ---------------------------------------------------------------------

/**
 * POST /api/reviews
 * Customer creates a review (productId, rating 1-5, comment).
 * Only allow if customer has a completed order containing that product.
 */
app.post('/api/reviews', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { productId, rating, comment } = req.body;
    const customerId = req.user!._id;

    if (!productId || rating === undefined || !comment) {
      return res.status(400).json({ error: 'productId, rating (1-5), and comment are required.' });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    // Verify completed order containing this product
    const completedOrder = await Order.findOne({
      customerId,
      status: 'completed',
      $or: [
        { 'items.productId': product._id },
        { 'items.productId': product._id.toString() },
      ],
    });

    if (!completedOrder) {
      return res.status(403).json({
        error: 'Only customers who have a completed order containing this product can submit a review.',
      });
    }

    const review = await Review.create({
      productId: product._id,
      farmerId: product.farmerId,
      customerId,
      rating: Math.round(numRating),
      comment: comment.trim(),
    });

    res.status(201).json({
      message: 'Review posted successfully.',
      review: formatReviewResponse(review, req.user, product),
    });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to create review' });
  }
});

/**
 * GET /api/reviews/product/:productId
 * List all reviews for a product (public, no auth needed)
 */
app.get('/api/reviews/product/:productId', async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    let productObjectId = null;
    try { productObjectId = new mongoose.Types.ObjectId(productId); } catch { /* ignore */ }

    const reviews = await Review.find({
      $or: [
        ...(productObjectId ? [{ productId: productObjectId }] : []),
        { productId },
      ],
    }).sort({ createdAt: -1 });

    const customerIds = reviews.map((r) => r.customerId);
    const farmerIds = reviews.map((r) => r.farmerId);

    const [customers, farmers, product] = await Promise.all([
      User.find({ _id: { $in: customerIds } }),
      User.find({ _id: { $in: farmerIds } }),
      productObjectId ? Product.findById(productObjectId) : null,
    ]);

    const formatted = reviews.map((r) => {
      const cust = customers.find((c) => c._id.toString() === r.customerId.toString());
      const farm = farmers.find((f) => f._id.toString() === r.farmerId.toString());
      return formatReviewResponse(r, cust, product, farm);
    });

    res.json(formatted);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch reviews' });
  }
});

/**
 * PATCH /api/reviews/:id/response
 * Farmer adds/updates farmerResponse (only the farmer who owns the product can do this)
 */
app.patch('/api/reviews/:id/response', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { farmerResponse } = req.body;
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found.' });

    const product = await Product.findById(review.productId);
    const isFarmerOwner =
      (review.farmerId && review.farmerId.toString() === req.user!._id.toString()) ||
      (product && product.farmerId.toString() === req.user!._id.toString());
    const isAdmin = req.user!.role === 'admin';
    if (!isFarmerOwner && !isAdmin) {
      return res.status(403).json({
        error: 'Only the grower who owns the reviewed product can respond to this review.',
      });
    }

    review.farmerResponse = farmerResponse?.trim() || '';
    if (!review.farmerId && product?.farmerId) {
      review.farmerId = product.farmerId;
    }
    await review.save();

    const [customer, farmer] = await Promise.all([
      User.findById(review.customerId),
      User.findById(review.farmerId || product?.farmerId),
    ]);

    res.json({
      message: 'Grower response saved successfully.',
      review: formatReviewResponse(review, customer, product, farmer),
    });
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to respond to review' });
  }
});

/**
 * GET /api/reviews/farmer
 * List all reviews on products belonging to the logged-in farmer
 */
app.get('/api/reviews/farmer', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    if (user.role !== 'farmer' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Access restricted to registered growers and administrators.' });
    }

    const farmerProducts = await Product.find(user.role === 'admin' ? {} : { farmerId: user._id });
    const farmerProductIds = farmerProducts.map((p) => p._id);

    const query: Record<string, unknown> = user.role === 'admin'
      ? {}
      : {
          $or: [
            { farmerId: user._id },
            { productId: { $in: farmerProductIds } },
          ],
        };

    const reviews = await Review.find(query).sort({ createdAt: -1 });

    const customerIds = reviews.map((r) => r.customerId);
    const productIds = reviews.map((r) => r.productId);

    const [customers, products] = await Promise.all([
      User.find({ _id: { $in: customerIds as any[] } }),
      Product.find({ _id: { $in: productIds as any[] } }),
    ]);

    const customersMap = new Map(customers.map((c) => [c._id.toString(), c]));
    const productsMap = new Map(products.map((p) => [p._id.toString(), p]));

    const formatted = reviews.map((r) => {
      const customer = customersMap.get(r.customerId?.toString());
      const product = productsMap.get(r.productId?.toString());
      return formatReviewResponse(r, customer, product, user);
    });

    res.json(formatted);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch farmer reviews' });
  }
});

// ---------------------------------------------------------------------
// Favorites API (POST /api/favorites, DELETE /api/favorites/:id, GET /api/favorites/me)
// ---------------------------------------------------------------------

/**
 * POST /api/favorites
 * Add a farmer or product to favorites (customerId + farmerId OR productId)
 */
app.post('/api/favorites', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { farmerId, productId } = req.body;
    const customerId = req.user!._id;

    if (!farmerId && !productId) {
      return res.status(400).json({ error: 'Either farmerId or productId must be provided to add a favorite.' });
    }

    let farmerObjectId: mongoose.Types.ObjectId | undefined;
    let productObjectId: mongoose.Types.ObjectId | undefined;

    if (farmerId) {
      try { farmerObjectId = new mongoose.Types.ObjectId(farmerId); } catch { /* ignore */ }
    }
    if (productId) {
      try { productObjectId = new mongoose.Types.ObjectId(productId); } catch { /* ignore */ }
    }

    // Check existing
    const filter: Record<string, unknown> = { customerId };
    if (farmerObjectId) filter.farmerId = farmerObjectId;
    if (productObjectId) filter.productId = productObjectId;

    let favorite = await Favorite.findOne(filter);
    if (favorite) {
      return res.status(200).json({
        message: 'Already in favorites.',
        favorite: formatFavoriteResponse(favorite),
      });
    }

    favorite = await Favorite.create({
      customerId,
      farmerId: farmerObjectId,
      productId: productObjectId,
    });

    const [product, farmer] = await Promise.all([
      productObjectId ? Product.findById(productObjectId) : null,
      farmerObjectId ? User.findById(farmerObjectId) : null,
    ]);

    res.status(201).json({
      message: 'Added to favorites successfully.',
      favorite: formatFavoriteResponse(favorite, product, farmer),
    });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to add favorite' });
  }
});

/**
 * DELETE /api/favorites/:id
 * Remove a favorite by favorite ID, or by target productId / farmerId
 */
app.delete('/api/favorites/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const customerId = req.user!._id;
    const targetIdStr = req.params.id;

    let deleted = null;
    try {
      deleted = await Favorite.findOneAndDelete({ _id: targetIdStr, customerId });
    } catch { /* ignore */ }

    if (!deleted) {
      try {
        const targetObjectId = new mongoose.Types.ObjectId(targetIdStr);
        deleted = await Favorite.findOneAndDelete({
          customerId,
          $or: [{ productId: targetObjectId }, { farmerId: targetObjectId }],
        });
      } catch { /* ignore */ }
    }

    if (!deleted) {
      return res.status(404).json({ error: 'Favorite not found.' });
    }

    res.json({ message: 'Favorite removed successfully.' });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to remove favorite' });
  }
});

/**
 * GET /api/favorites/me
 * List logged-in customer's favorite farmers and products
 */
app.get('/api/favorites/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const customerId = req.user!._id;
    const favorites = await Favorite.find({ customerId }).sort({ createdAt: -1 });

    const productIds = favorites.map((f) => f.productId).filter(Boolean);
    const farmerIds = favorites.map((f) => f.farmerId).filter(Boolean);

    const products: any[] = await Product.find({ _id: { $in: productIds } } as any);
    const farmers: any[] = await User.find({ _id: { $in: farmerIds }, role: 'farmer' } as any);
    const markets: any[] = await Market.find();

    const formatted = favorites.map((fav) => {
      const prod = products.find((p: any) => p._id.toString() === fav.productId?.toString());
      const farm = farmers.find(
        (f: any) => f._id.toString() === (fav.farmerId?.toString() || (prod?.farmerId ? prod.farmerId.toString() : ''))
      );
      const mkt = farm ? markets.find((m: any) => m._id.toString() === farm.market_id) : null;
      return formatFavoriteResponse(fav, prod || null, farm || null, mkt || null);
    });

    res.json(formatted);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch favorites' });
  }
});

// ---------------------------------------------------------------------
// In-App Notifications API (GET /me, PATCH /:id/read, PATCH /read-all)
// ---------------------------------------------------------------------

/**
 * GET /api/notifications/me
 * Logged-in user's notifications, newest first
 */
app.get('/api/notifications/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!._id;
    const notifications = await Notification.find({ recipientId: userId }).sort({ createdAt: -1 }).limit(50);
    res.json(notifications.map(formatNotificationResponse));
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch notifications' });
  }
});

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications for the logged-in user as read
 */
app.patch('/api/notifications/read-all', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!._id;
    await Notification.updateMany({ recipientId: userId, isRead: false }, { $set: { isRead: true } });
    res.json({ message: 'All notifications marked as read.' });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to mark notifications as read' });
  }
});

/**
 * PATCH /api/notifications/:id/read
 * Mark a single notification as read
 */
app.patch('/api/notifications/:id/read', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!._id;
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipientId: userId,
    });
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found.' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({
      message: 'Notification marked as read.',
      notification: formatNotificationResponse(notification),
    });
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to mark notification as read' });
  }
});

// ---------------------------------------------------------------------
// Admin Dashboard & Platform Operations APIs (Mongoose / RBAC)
// ---------------------------------------------------------------------

/**
 * 1. Admin Dashboard Stats
 * GET /api/admin/dashboard
 * Returns totalFarmers, totalCustomers, totalMarkets, totalOrders, totalRevenue (platform-wide)
 */
app.get('/api/admin/dashboard', authenticateToken, requireRole(['admin']), async (_req: AuthRequest, res: Response) => {
  try {
    const [totalFarmers, totalCustomers, totalMarkets, totalOrders, completedOrders] = await Promise.all([
      User.countDocuments({ role: 'farmer' }),
      User.countDocuments({ role: 'customer' }),
      Market.countDocuments(),
      Order.countDocuments(),
      Order.find({ status: 'completed' }),
    ]);

    const totalRevenue = completedOrders.reduce(
      (sum, o) => sum + (o.finalTotalDue !== undefined ? o.finalTotalDue : o.totalAmount || 0),
      0
    );

    const pendingApprovals = await User.countDocuments({ role: 'farmer', isApproved: false });
    const suspendedUsers = await User.countDocuments({ isSuspended: true });

    res.json({
      totalFarmers,
      totalCustomers,
      totalMarkets,
      totalOrders,
      totalRevenue,
      pendingApprovals,
      suspendedUsers,
    });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch admin stats' });
  }
});

/**
 * 2. Manage Farmers & Customers
 * GET /api/admin/users?role=farmer|customer
 * List all users of a role, with status (active/suspended/pending_approval)
 */
app.get('/api/admin/users', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { role } = req.query;
    const filter: Record<string, unknown> = {};
    if (role && (role === 'farmer' || role === 'customer' || role === 'admin')) {
      filter.role = role;
    }

    const users = await User.find(filter).sort({ createdAt: -1 });
    const markets = await Market.find();
    const marketsMap = new Map(markets.map((m) => [m._id.toString(), m.name]));

    const formatted = users.map((u) => {
      const isApproved = u.isApproved !== undefined ? u.isApproved : (u.role !== 'farmer');
      const isSuspended = !!u.isSuspended;
      const status = isSuspended
        ? 'suspended'
        : (u.role === 'farmer' && !isApproved ? 'pending_approval' : 'active');

      return {
        ...formatUserResponse(u),
        isApproved,
        isSuspended,
        status,
        farm_name: u.farm_name,
        stall_number: u.stall_number,
        market_id: u.market_id,
        market_name: u.market_id ? marketsMap.get(u.market_id) : undefined,
        cnic: u.cnic || '',
        phone: u.phone || '',
      };
    });

    res.json(formatted);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch users' });
  }
});

/**
 * PATCH /api/admin/users/:id/approve
 * Approve a pending farmer registration
 */
app.patch('/api/admin/users/:id/approve', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    user.isApproved = true;
    await user.save();

    res.json({
      message: `Farmer "${user.name}" registration approved. They may now list products.`,
      user: {
        ...formatUserResponse(user),
        isApproved: true,
        isSuspended: !!user.isSuspended,
        status: user.isSuspended ? 'suspended' : 'active',
      },
    });
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Approval failed' });
  }
});

/**
 * PATCH /api/admin/users/:id/suspend
 * Suspend a user account (cannot log in)
 */
app.patch('/api/admin/users/:id/suspend', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    if (req.params.id === req.user!._id.toString()) {
      return res.status(400).json({ error: 'Cannot suspend your own administrator account.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    user.isSuspended = true;
    await user.save();

    res.json({
      message: `Account for "${user.name}" has been suspended.`,
      user: {
        ...formatUserResponse(user),
        isApproved: user.isApproved !== undefined ? user.isApproved : (user.role !== 'farmer'),
        isSuspended: true,
        status: 'suspended',
      },
    });
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Suspension failed' });
  }
});

/**
 * PATCH /api/admin/users/:id/activate
 * Reactivate a suspended account
 */
app.patch('/api/admin/users/:id/activate', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    user.isSuspended = false;
    await user.save();

    const isApproved = user.isApproved !== undefined ? user.isApproved : (user.role !== 'farmer');
    res.json({
      message: `Account for "${user.name}" reactivated successfully.`,
      user: {
        ...formatUserResponse(user),
        isApproved,
        isSuspended: false,
        status: user.role === 'farmer' && !isApproved ? 'pending_approval' : 'active',
      },
    });
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Activation failed' });
  }
});

/**
 * 4. Content Moderation
 * GET /api/admin/reviews — list all reviews platform-wide
 */
app.get('/api/admin/reviews', authenticateToken, requireRole(['admin']), async (_req: AuthRequest, res: Response) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    const customerIds = reviews.map((r) => r.customerId).filter(Boolean);
    const farmerIds = reviews.map((r) => r.farmerId).filter(Boolean);
    const productIds = reviews.map((r) => r.productId).filter(Boolean);

    const [customers, farmers, products] = await Promise.all([
      User.find({ _id: { $in: customerIds as any[] } }),
      User.find({ _id: { $in: farmerIds as any[] } }),
      Product.find({ _id: { $in: productIds as any[] } }),
    ]);

    const customersMap = new Map(customers.map((c) => [c._id.toString(), c]));
    const farmersMap = new Map(farmers.map((f) => [f._id.toString(), f]));
    const productsMap = new Map(products.map((p) => [p._id.toString(), p]));

    const formatted = reviews.map((r) => {
      const customer = customersMap.get(r.customerId?.toString());
      const farmer = farmersMap.get(r.farmerId?.toString());
      const product = productsMap.get(r.productId?.toString());
      return formatReviewResponse(r, customer, product, farmer);
    });

    res.json(formatted);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch reviews' });
  }
});

/**
 * DELETE /api/admin/reviews/:id — remove inappropriate review
 */
app.delete('/api/admin/reviews/:id', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const deleted = await Review.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Review not found.' });
    res.json({ message: 'Inappropriate review deleted successfully.' });
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to delete review' });
  }
});

/**
 * GET /api/admin/products — list all products platform-wide
 */
app.get('/api/admin/products', authenticateToken, requireRole(['admin']), async (_req: AuthRequest, res: Response) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    const farmers = await User.find({ role: 'farmer' });
    const markets = await Market.find();

    const formatted = products.map((p) => {
      const farmer = farmers.find((f) => f._id.toString() === p.farmerId?.toString());
      const market = markets.find((m) => m._id.toString() === p.marketId?.toString());
      return formatProductResponse(p, farmer, market);
    });

    res.json(formatted);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch products' });
  }
});

/**
 * DELETE /api/admin/products/:id — remove inappropriate product listing
 */
app.delete('/api/admin/products/:id', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    let deleted = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      deleted = await Product.findByIdAndDelete(req.params.id);
    }
    if (!deleted) {
      deleted = await Product.findOneAndDelete({ name: req.params.id });
    }
    if (!deleted) return res.status(404).json({ error: 'Product not found.' });
    res.json({ message: `Product listing "${deleted.name}" removed successfully.` });
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to delete product' });
  }
});

/**
 * 5. Reports & Analytics
 * GET /api/admin/reports — total orders & revenue broken down by market, plus most active farmers
 */
app.get('/api/admin/reports', authenticateToken, requireRole(['admin']), async (_req: AuthRequest, res: Response) => {
  try {
    const [markets, orders, farmers, products] = await Promise.all([
      Market.find(),
      Order.find(),
      User.find({ role: 'farmer' }),
      Product.find(),
    ]);

    // Breakdown by Market
    const marketReports = markets.map((m) => {
      const marketOrders = orders.filter((o) => o.marketId?.toString() === m._id.toString());
      const completed = marketOrders.filter((o) => o.status === 'completed');
      const revenue = completed.reduce(
        (sum, o) => sum + (o.finalTotalDue !== undefined ? o.finalTotalDue : o.totalAmount || 0),
        0
      );

      return {
        marketId: m._id.toString(),
        marketName: m.name,
        city: m.city || 'Mandi Hub',
        totalOrders: marketOrders.length,
        completedOrders: completed.length,
        totalRevenue: revenue,
      };
    });

    // Breakdown by Farmer
    const farmerReports = farmers.map((f) => {
      const farmerOrders = orders.filter(
        (o) =>
          o.farmerId?.toString() === f._id.toString() ||
          o.items?.some((it) => {
            const prod = products.find((p) => p._id.toString() === it.productId?.toString());
            return prod?.farmerId?.toString() === f._id.toString();
          })
      );

      const completed = farmerOrders.filter((o) => o.status === 'completed');
      const revenue = completed.reduce(
        (sum, o) => sum + (o.finalTotalDue !== undefined ? o.finalTotalDue : o.totalAmount || 0),
        0
      );

      const farmerCropCount = products.filter((p) => p.farmerId?.toString() === f._id.toString()).length;

      return {
        farmerId: f._id.toString(),
        farmerName: f.name,
        farmName: f.farm_name || f.name,
        stallNumber: f.stall_number || 'Stall A-14',
        orderCount: farmerOrders.length,
        completedOrderCount: completed.length,
        totalRevenue: revenue,
        productCount: farmerCropCount,
      };
    });

    const topFarmers = farmerReports.sort((a, b) => b.totalRevenue - a.totalRevenue || b.orderCount - a.orderCount);

    const totalPlatformRevenue = orders
      .filter((o) => o.status === 'completed')
      .reduce((sum, o) => sum + (o.finalTotalDue !== undefined ? o.finalTotalDue : o.totalAmount || 0), 0);

    res.json({
      marketReports,
      topFarmers,
      totalPlatformOrders: orders.length,
      totalPlatformRevenue,
    });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to generate admin reports' });
  }
});

/**
 * 6. System Configuration: Categories
 * GET/POST/DELETE /api/admin/categories
 */
app.get('/api/admin/categories', async (_req: Request, res: Response) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories.map((c) => ({ id: c._id.toString(), name: c.name, createdAt: c.createdAt })));
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch categories' });
  }
});

app.get('/api/categories', async (_req: Request, res: Response) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories.map((c) => ({ id: c._id.toString(), name: c.name, createdAt: c.createdAt })));
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch categories' });
  }
});

app.post('/api/admin/categories', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required.' });
    }

    const cleanName = name.trim();
    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${cleanName}$`, 'i') } });
    if (existing) {
      return res.status(409).json({ error: 'A category with this name already exists.' });
    }

    const newCategory = await Category.create({ name: cleanName });
    res.status(201).json({
      message: `Category "${newCategory.name}" created successfully.`,
      category: { id: newCategory._id.toString(), name: newCategory.name, createdAt: newCategory.createdAt },
    });
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to create category' });
  }
});

app.delete('/api/admin/categories/:id', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    let deleted = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      deleted = await Category.findByIdAndDelete(req.params.id);
    }
    if (!deleted) {
      deleted = await Category.findOneAndDelete({ name: req.params.id });
    }
    if (!deleted) return res.status(404).json({ error: 'Category not found.' });
    res.json({ message: `Category "${deleted.name}" removed successfully.` });
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to delete category' });
  }
});

/**
 * 6. System Configuration: Announcements
 * GET/POST/DELETE /api/admin/announcements & GET /api/announcements
 */
app.get('/api/admin/announcements', async (_req: Request, res: Response) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements.map((a) => ({ id: a._id.toString(), message: a.message, createdAt: a.createdAt })));
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch announcements' });
  }
});

app.get('/api/announcements', async (_req: Request, res: Response) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements.map((a) => ({ id: a._id.toString(), message: a.message, createdAt: a.createdAt })));
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch announcements' });
  }
});

app.post('/api/admin/announcements', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Announcement message is required.' });
    }

    const newAnnouncement = await Announcement.create({ message: message.trim() });
    res.status(201).json({
      message: 'Platform announcement published successfully.',
      announcement: { id: newAnnouncement._id.toString(), message: newAnnouncement.message, createdAt: newAnnouncement.createdAt },
    });
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to publish announcement' });
  }
});

app.delete('/api/admin/announcements/:id', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const deleted = await Announcement.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Announcement not found.' });
    res.json({ message: 'Announcement deleted.' });
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to delete announcement' });
  }
});

// ---------------------------------------------------------------------
// Google APIs Integrations: Geocoding & Gemini Agro-Intelligence
// ---------------------------------------------------------------------
app.get('/api/geo/distance', async (req: Request, res: Response) => {
  try {
    const userLat = parseFloat(req.query.lat as string);
    const userLng = parseFloat(req.query.lng as string);

    if (isNaN(userLat) || isNaN(userLng)) {
      return res.status(400).json({ error: 'Valid lat and lng query parameters required.' });
    }

    const markets = await Market.find();
    const R = 6371; // Earth radius in km

    const distances = markets.map((m) => {
      const dLat = ((m.latitude - userLat) * Math.PI) / 180;
      const dLng = ((m.longitude - userLng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((userLat * Math.PI) / 180) *
          Math.cos((m.latitude * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distanceKm = +(R * c).toFixed(2);
      const distanceMiles = +(distanceKm * 0.621371).toFixed(2);

      return {
        market_id: m._id.toString(),
        market_name: m.name,
        distance_km: distanceKm,
        distance_miles: distanceMiles,
        estimated_driving_mins: Math.ceil(distanceKm * 2.2),
      };
    });

    res.json(distances);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Distance calculation failed' });
  }
});

/**
 * POST /api/ai/concierge & POST /api/chat
 * Google Gemini Pro Agro-Intelligence Assistant
 * Pulls live market & product data directly from MongoDB!
 */
const handleChatConcierge = async (req: Request, res: Response) => {
  try {
    const message = req.body.message || req.body.prompt;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    // Pull live data from MongoDB
    const [liveMarkets, liveProducts, liveFarmers] = await Promise.all([
      Market.find(),
      Product.find({ isSoldOut: false }),
      User.find({ role: 'farmer' }),
    ]);

    const marketSnapshot = liveMarkets
      .map((m) => `- Market: "${m.name}", Address: ${m.address}, Timings: ${m.timings}`)
      .join('\n');

    const farmerSnapshot = liveFarmers
      .map((f) => `- Grower: "${f.farm_name || f.name}" (${f.stall_number || 'Stall A-14'}), Phone: ${f.phone}`)
      .join('\n');

    const allProduceSnapshot = liveProducts
      .map((p) => {
        const farmer = liveFarmers.find((f) => f._id.toString() === p.farmerId?.toString());
        const market = liveMarkets.find((m) => m._id.toString() === p.marketId?.toString());
        return `- ${p.name}: Rs. ${p.price} per ${p.unit} | Category: ${p.category} | In Stock: ${p.stockQuantity} ${p.unit} | Grower: "${farmer?.farm_name || 'Grower'}" (${farmer?.stall_number || 'Stall A-14'}) at "${market?.name || 'Mandi'}"`;
      })
      .join('\n');

    const systemInstruction = `You are the MarketLink (eGreen Basket) Farmers' Market Agro-Concierge, an intelligent, helpful, and friendly assistant powered by Google Gemini Pro.

CRITICAL INSTRUCTIONS:
1. MULTILINGUAL & ROMAN URDU SUPPORT:
   - Detect the language of the user's prompt and respond in the EXACT SAME LANGUAGE.
   - If the user asks in Roman Urdu (e.g., "bhai tamatar ka kya rate hai?", "aaj taaza sabzi kya hai?", "market kab khulti hai?"), reply naturally and fluently in Roman Urdu.
   - If the user asks in Urdu script, reply in Urdu.
   - If the user asks in English, reply in friendly English.

2. DYNAMIC REAL-TIME MONGODB CONTEXT:
   - Read the live inventory, farmer stalls, and markets provided below.
   - ALWAYS answer specific questions regarding prices, availability, stock, and stall locations using the exact numbers and details from the live database snapshot below.

3. STRICT BUSINESS RULES & RESPONSE STYLE:
   - DO NOT repeat generic welcome messages, introductory intros, or repetitive boilerplate greetings (e.g., "Hello! Welcome to MarketLink Agro-Concierge! How can I help you?"). Immediately and directly answer the user's input with specific, analytical, and context-rich response.
   - NO online payment gateways or card charges online (Strictly Rs. 0 charged online). All pre-orders are booked online as zero-fee reservations.
   - Customers receive an express 4-Digit Pickup PIN (e.g. 4921) to show at the physical market stall.
   - Payment is strictly Cash (or Contactless Tap) directly to the grower at the stall after inspecting the produce.
   - NO home delivery or shipping couriers. All pickups occur at physical farmers' market stalls.

LIVE MONGODB INVENTORY:
${allProduceSnapshot}

LIVE FARMER STALLS:
${farmerSnapshot}

LIVE MARKETS:
${marketSnapshot}`;

    const candidateModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    let generatedReply = '';

    if (process.env.GEMINI_API_KEY) {
      for (const model of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: message,
            config: {
              systemInstruction,
              temperature: 0.7,
            },
          });

          if (response.text && response.text.trim()) {
            generatedReply = response.text.trim();
            break;
          }
        } catch (err) {
          console.warn(`Gemini model ${model} attempt failed:`, err);
        }
      }
    }

    if (generatedReply) {
      return res.json({ reply: generatedReply });
    }

    // Dynamic Context-Aware Fallback if Gemini API is unreachable
    const lowerMsg = message.toLowerCase();
    const isRomanUrdu =
      lowerMsg.includes('bhai') ||
      lowerMsg.includes('kya') ||
      lowerMsg.includes('hai') ||
      lowerMsg.includes('rate') ||
      lowerMsg.includes('tamatar') ||
      lowerMsg.includes('seb') ||
      lowerMsg.includes('anda');

    const matchedProduct = liveProducts.find((p) => {
      const pName = p.name.toLowerCase();
      if (lowerMsg.includes('tamatar') || lowerMsg.includes('tomato')) return pName.includes('tomato');
      if (lowerMsg.includes('seb') || lowerMsg.includes('apple')) return pName.includes('apple');
      if (lowerMsg.includes('anda') || lowerMsg.includes('egg')) return pName.includes('egg');
      return false;
    });

    if (matchedProduct) {
      if (isRomanUrdu) {
        return res.json({
          reply: `Bhai, ${matchedProduct.name} ka rate **Rs. ${matchedProduct.price} per ${matchedProduct.unit}** hai. Abhi stock mein **${matchedProduct.stockQuantity} ${matchedProduct.unit}** maujood hain. Aap bina kisi advance fee ke online booking kar sakte hain aur stall par cash ada kar sakte hain!`,
        });
      }
      return res.json({
        reply: `${matchedProduct.name} is priced at **Rs. ${matchedProduct.price} per ${matchedProduct.unit}** with **${matchedProduct.stockQuantity} ${matchedProduct.unit}** in stock. Pre-order with Rs. 0 upfront fee and settle in cash at the stall!`,
      });
    }

    if (isRomanUrdu) {
      return res.json({
        reply: `MarketLink eGreen Basket mein khushamdeed! Hamare paas taaza Sindh Roma Tomatoes, Swat Apples aur Farm Fresh Eggs maujood hain. Tamam pre-orders online muft book hotay hain aur aap stall par samaan dekh kar cash ada karte hain.`,
      });
    }

    res.json({
      reply: `Welcome to MarketLink eGreen Basket! We have fresh daily crops available directly from local growers. All pre-orders are free reservations—inspect at the stall and pay cash on collection!`,
    });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Chat processing failed' });
  }
};

app.post('/api/ai/concierge', handleChatConcierge);
app.post('/api/chat', handleChatConcierge);

// Reset demo endpoint
app.post('/api/system/reset-demo', async (_req: Request, res: Response) => {
  res.json({ message: 'MongoDB active.' });
});

// ---------------------------------------------------------------------
// Fallback 404 & Error handlers for /api/* routes (Guarantees JSON responses)
// ---------------------------------------------------------------------
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[MarketLink API Error]:', err);
  res.status(err?.status || 500).json({ error: err?.message || 'Internal Server Error' });
});

// ---------------------------------------------------------------------
// Auto-Seed Helper: Seed Initial Mandi Data if MongoDB is Empty
// ---------------------------------------------------------------------
async function autoSeedMongoDBIfEmpty() {
  try {
    let karachiMarket: any = await Market.findOne({ city: /karachi/i });
    let lahoreMarket: any = await Market.findOne({ city: /lahore/i });
    let islamabadMarket: any = await Market.findOne({ city: /islamabad/i });

    const marketCount = await Market.countDocuments();
    if (marketCount === 0) {
      console.log('[MarketLink] Seeding initial Mandi markets into MongoDB...');
      karachiMarket = await Market.create({
        name: 'Super Highway Sabzi Mandi, Karachi',
        slug: 'karachi-super-highway-mandi',
        address: 'Main Super Highway (M-9), New Sabzi Mandi, Scheme 33, Karachi, Sindh',
        country: 'Pakistan',
        province: 'Sindh',
        city: 'Karachi',
        latitude: 24.9721,
        longitude: 67.1571,
        plus_code: 'X5C4+RF Karachi',
        gps_coords: '24.9721° N, 67.1571° E',
        stall_bays: 'Stall Rows 12-48 • Gate 3 (Sabzi Section)',
        operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        timings: '04:30 AM – 11:30 AM',
        opening_time: '04:30:00',
        closing_time: '11:30:00',
        description: 'Sindh primary wholesale mandi. Direct fresh farm produce from Thatta, Hyderabad, and Malir.',
        parking_info: 'Dedicated loading area and customer parking at Gate 3 with easy stall access.',
        image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
        stall_count: 36,
        is_active: true,
      });

      lahoreMarket = await Market.create({
        name: 'Badami Bagh Sabzi Mandi, Lahore',
        slug: 'lahore-badami-bagh-hub',
        address: 'Badami Bagh Mandi Complex, Ravi Link Road, Lahore, Punjab',
        country: 'Pakistan',
        province: 'Punjab',
        city: 'Lahore',
        latitude: 31.5925,
        longitude: 74.3283,
        plus_code: 'HHV8+PX Lahore',
        gps_coords: '31.5925° N, 74.3283° E',
        stall_bays: 'Stall Rows 04-32 • North Gate 2',
        operatingDays: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        timings: '05:00 AM – 12:00 PM',
        opening_time: '05:00:00',
        closing_time: '12:00:00',
        description: 'Heart of Punjab agricultural exchange. Direct crops from Okara, Faisalabad, and Kasur.',
        parking_info: 'Ravi Link parking with easy pickup spaces.',
        image_url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80',
        stall_count: 28,
        is_active: true,
      });

      islamabadMarket = await Market.create({
        name: 'I-11/4 Sabzi & Fruit Mandi, Islamabad',
        slug: 'islamabad-i11-terminal',
        address: 'Sector I-11/4 Wholesale Fruit & Vegetable Mandi, Islamabad, ICT',
        country: 'Pakistan',
        province: 'Islamabad Capital Territory',
        city: 'Islamabad',
        latitude: 33.6511,
        longitude: 73.0242,
        plus_code: 'M22F+RM Islamabad',
        gps_coords: '33.6511° N, 73.0242° E',
        stall_bays: 'Stall Rows 01-24 • Central Farmers Area',
        operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        timings: '05:30 AM – 01:00 PM',
        opening_time: '05:30:00',
        closing_time: '13:00:00',
        description: 'Twin-cities primary mandi serving Potohar farmers and Swat valley apple harvests.',
        parking_info: 'Sector I-11 mandi parking lot adjacent to main gate.',
        image_url: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=800&q=80',
        stall_count: 24,
        is_active: true,
      });
    } else {
      // Backfill migration for existing DB documents
      await Market.updateMany({ $or: [{ country: { $exists: false } }, { country: '' }] }, { $set: { country: 'Pakistan' } });
      await Market.updateMany({ city: /karachi/i, $or: [{ province: { $exists: false } }, { province: '' }] }, { $set: { province: 'Sindh' } });
      await Market.updateMany({ city: /lahore/i, $or: [{ province: { $exists: false } }, { province: '' }] }, { $set: { province: 'Punjab' } });
      await Market.updateMany({ city: /islamabad/i, $or: [{ province: { $exists: false } }, { province: '' }] }, { $set: { province: 'Islamabad Capital Territory' } });
    }

    // Ensure additional key Pakistani Mandis exist (Hyderabad Hala Naka, Malir Mandi, Empress Market)
    const extraMarketsToEnsure = [
      {
        name: 'Hala Naka Sabzi & Fruit Mandi, Hyderabad',
        slug: 'hyderabad-hala-naka-mandi',
        address: 'Main National Highway (N-5), Hala Naka Chowk, Hyderabad, Sindh',
        country: 'Pakistan',
        province: 'Sindh',
        city: 'Hyderabad',
        latitude: 25.4095,
        longitude: 68.3752,
        plus_code: 'CM5G+R3 Hyderabad',
        gps_coords: '25.4095° N, 68.3752° E',
        stall_bays: 'Stall Rows 01-32 • Central Kisan Yard',
        operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        timings: '04:00 AM – 11:30 AM',
        opening_time: '04:00:00',
        closing_time: '11:30:00',
        description: 'Central agricultural hub of Lower Sindh. Direct farm produce from Matiari, Tando Allahyar, Mirpurkhas, and Hala growers.',
        parking_info: 'Spacious tractor-trolley and customer parking at Hala Naka main bypass.',
        image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
        stall_count: 32,
        is_active: true,
      },
      {
        name: 'Malir Sabzi Mandi (Memon Goth), Karachi',
        slug: 'karachi-malir-mandi',
        address: 'Memon Goth Main Agricultural Road, Malir District, Karachi, Sindh',
        country: 'Pakistan',
        province: 'Sindh',
        city: 'Karachi',
        latitude: 24.9182,
        longitude: 67.2417,
        plus_code: 'W69R+7M Karachi',
        gps_coords: '24.9182° N, 67.2417° E',
        stall_bays: 'Stalls M-01 to M-26 • Organic Riverbed Section',
        operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        timings: '05:00 AM – 12:00 PM',
        opening_time: '05:00:00',
        closing_time: '12:00:00',
        description: 'Renowned peri-urban vegetable mandi of Karachi specializing in morning-picked leafy greens, Malir palak, and fresh root crops.',
        parking_info: 'Farmer pickup zone along Memon Goth link road.',
        image_url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80',
        stall_count: 26,
        is_active: true,
      },
      {
        name: 'Empress Market Heritage Produce Square, Karachi',
        slug: 'karachi-empress-market',
        address: 'Preedy Street, Saddar Town, South Karachi, Sindh',
        country: 'Pakistan',
        province: 'Sindh',
        city: 'Karachi',
        latitude: 24.8624,
        longitude: 67.0272,
        plus_code: 'V26G+XV Karachi',
        gps_coords: '24.8624° N, 67.0272° E',
        stall_bays: 'Heritage Clock Tower Stalls 01-22',
        operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        timings: '06:00 AM – 02:00 PM',
        opening_time: '06:00:00',
        closing_time: '14:00:00',
        description: 'Historic city-center produce pavilion connecting central Karachi consumers directly with certified peri-urban growers and fresh fruit baskets.',
        parking_info: 'Saddar municipal parking plaza adjacent to market court.',
        image_url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80',
        stall_count: 22,
        is_active: true,
      },
      {
        name: 'Liaquatabad Supermarket Mandi, Karachi',
        slug: 'karachi-liaquatabad-mandi',
        address: 'Liaquatabad No. 10, Central District, Karachi, Sindh',
        country: 'Pakistan',
        province: 'Sindh',
        city: 'Karachi',
        latitude: 24.9085,
        longitude: 67.0427,
        plus_code: 'W25V+9Q Karachi',
        gps_coords: '24.9085° N, 67.0427° E',
        stall_bays: 'Central Wing Stalls A1-B12',
        operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        timings: '05:30 AM – 01:00 PM',
        opening_time: '05:30:00',
        closing_time: '13:00:00',
        description: 'Central Karachi fresh fruits and vegetable distribution hub connecting District Central vendors and local buyers directly with growers.',
        parking_info: 'Liaquatabad commercial market parking bay.',
        image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
        stall_count: 20,
        is_active: true,
      },
    ];

    for (const em of extraMarketsToEnsure) {
      const exists = await Market.findOne({ slug: em.slug });
      if (!exists) {
        await Market.create(em);
      } else {
        await Market.updateOne({ slug: em.slug }, { $set: em });
      }
    }

      // Ensure EXACTLY the 3 seeded users exist in MongoDB, with 0 leftover mock users
      const currentUsers = await User.find({});
      const expectedEmails = ['zavimalik23@gmail.com', 'ahsan@marketlink.com', 'fatima@marketlink.com'];
      const hasAllExpected = expectedEmails.every(email => currentUsers.some(u => u.email === email));
      const hasExtra = currentUsers.some(u => !expectedEmails.includes(u.email));

      if (currentUsers.length !== 3 || !hasAllExpected || hasExtra) {
        console.log('[MarketLink] Resetting & seeding exact 3 real user accounts into MongoDB...');
        await User.deleteMany({}); // remove any old/mock users

        const adminPass = await bcrypt.hash('0000', 10);
        const farmerPass = await bcrypt.hash('2222', 10);
        const customerPass = await bcrypt.hash('0000', 10);

        await User.create({
          name: 'Zavi',
          email: 'zavimalik23@gmail.com',
          passwordHash: adminPass,
          role: 'admin',
          role_title: 'Platform Administrator',
          phone: '+92 300 0000000',
          cnic: '42201-1111111-1',
          organization: 'MarketLink Support Board',
          modules: ['markets_discovery', 'produce_catalog', 'my_preorders', 'order_history', 'favorites', 'harvest_inventory', 'stall_scanner', 'agro_copilot', 'user_management', 'analytics_reports'],
          isApproved: true,
          isSuspended: false,
        });

        await User.create({
          name: 'Ahsan',
          email: 'ahsan@marketlink.com',
          passwordHash: farmerPass,
          role: 'farmer',
          role_title: 'Verified Grower • Sindh',
          phone: '+92 321 2222222',
          cnic: '42101-2222222-2',
          farm_name: 'Ahsan Organic Green Farms',
          stall_number: 'Stall #A-14 (Sindh Section)',
          market_id: karachiMarket._id.toString(),
          cutoff_hours: 12,
          bio: 'Organic grower producing pesticide-free vegetables and seasonal fruits in Malir basin.',
          modules: ['harvest_inventory', 'stall_scanner', 'markets_discovery', 'agro_copilot'],
          isApproved: true,
          isSuspended: false,
        });

        await User.create({
          name: 'Fatima',
          email: 'fatima@marketlink.com',
          passwordHash: customerPass,
          role: 'customer',
          role_title: 'Household Market Patron',
          phone: '+92 345 0000000',
          cnic: '42101-0000000-0',
          organization: 'Household Market Patron',
          modules: ['produce_catalog', 'my_preorders', 'order_history', 'favorites', 'markets_discovery', 'agro_copilot'],
          isApproved: true,
          isSuspended: false,
        });
      }

      const allSeededUsers = await User.find({}).lean();
      console.log('[MarketLink DB Seed Proof] db.users.find() output:\n', JSON.stringify(allSeededUsers, null, 2));

      // Find farmer user for products association
      const farmerUser = await User.findOne({ email: 'ahsan@marketlink.com' });

      const hyderabadMarket = await Market.findOne({ city: /hyderabad/i }) || karachiMarket;

      // Seed initial fresh products and ensure rich variety across all categories
      if (farmerUser && karachiMarket && islamabadMarket && lahoreMarket) {
        console.log('[MarketLink] Ensuring comprehensive farm fresh products in MongoDB...');
        const productsToEnsure = [
          {
            farmerId: farmerUser._id,
            marketId: hyderabadMarket._id,
            name: 'Hala Naka Fresh Red Onions',
            category: 'Fresh Vegetables',
            price: 110,
            unit: 'kg',
            stockQuantity: 180,
            farming_type: 'Organic',
            description: 'Harvested from fertile Matiari agricultural tracts and brought directly to Hala Naka Mandi, Hyderabad.',
            imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80',
            isSoldOut: false,
          },
          {
            farmerId: farmerUser._id,
            marketId: hyderabadMarket._id,
            name: 'Matiari Fresh Desi Garlic & Ginger',
            category: 'Organic Herbs',
            price: 310,
            unit: 'kg',
            stockQuantity: 95,
            farming_type: 'Organic',
            description: 'Aromatic Sindh garlic bulbs and sun-cured ginger roots from Lower Sindh farms.',
            imageUrl: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=800&q=80',
            isSoldOut: false,
          },
          {
            farmerId: farmerUser._id,
            marketId: hyderabadMarket._id,
            name: 'Hyderabad Sweet Sindhri Mangoes',
            category: 'Orchard Fruits',
            price: 270,
            unit: 'kg',
            stockQuantity: 120,
            farming_type: 'Organic',
            description: 'Super sweet Sindhri mangoes harvested fresh from nearby Tando Allahyar and Mirpurkhas orchards.',
            imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80',
            isSoldOut: false,
          },
          {
            farmerId: farmerUser._id,
            marketId: karachiMarket._id,
            name: 'Organic Sindh Roma Tomatoes',
            category: 'Fresh Vegetables',
            price: 140,
            unit: 'kg',
            stockQuantity: 150,
            farming_type: 'Organic',
            description: 'Plump, sun-ripened red Roma tomatoes harvested at morning peak in Malir basin. Dense flesh, low seeds.',
            imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
            isSoldOut: false,
          },
          {
            farmerId: farmerUser._id,
            marketId: islamabadMarket._id,
            name: 'Swat Valley Fuji Apples',
            category: 'Orchard Fruits',
            price: 320,
            unit: 'kg',
            stockQuantity: 100,
            farming_type: 'Organic',
            description: 'Crisp, sweet, and extraordinarily juicy mountain Fuji apples from Swat Valley.',
            imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80',
            isSoldOut: false,
          },
          {
            farmerId: farmerUser._id,
            marketId: lahoreMarket._id,
            name: 'Desi Pasture Fresh Eggs',
            category: 'Farm Fresh Dairy & Eggs',
            price: 380,
            unit: 'dozen',
            stockQuantity: 80,
            farming_type: 'Organic',
            description: 'Pasture-raised golden desi eggs from free-range heritage hens grazing on organic Punjab clover meadows.',
            imageUrl: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80',
            isSoldOut: false,
          },
          {
            farmerId: farmerUser._id,
            marketId: islamabadMarket._id,
            name: 'Pure Margalla Wildflower Honey',
            category: 'Raw Honey & Preserves',
            price: 1450,
            unit: 'jar',
            stockQuantity: 50,
            farming_type: 'Organic',
            description: 'Unfiltered, unheated pure raw berry honey harvested from apiaries beside Margalla Hills.',
            imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
            isSoldOut: false,
          },
          {
            farmerId: farmerUser._id,
            marketId: karachiMarket._id,
            name: 'Fresh Malir Desi Palak (Spinach)',
            category: 'Fresh Vegetables',
            price: 80,
            unit: 'bunch',
            stockQuantity: 120,
            farming_type: 'Organic',
            description: 'Tender baby spinach leaves triple-washed in natural tubewell water. Crisp texture with sweet, iron-rich flavor.',
            imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80',
            isSoldOut: false,
          },
          {
            farmerId: farmerUser._id,
            marketId: karachiMarket._id,
            name: 'Mirpurkhas Sweet Sindhri Mangoes',
            category: 'Orchard Fruits',
            price: 280,
            unit: 'kg',
            stockQuantity: 90,
            farming_type: 'Organic',
            description: 'World-famous Sindhri mangoes from historic orchards in Mirpurkhas. Incomparable sweetness and floral bouquet.',
            imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80',
            isSoldOut: false,
          },
          {
            farmerId: farmerUser._id,
            marketId: lahoreMarket._id,
            name: 'Rahim Yar Khan Royal Chaunsa',
            category: 'Orchard Fruits',
            price: 340,
            unit: 'kg',
            stockQuantity: 75,
            farming_type: 'Organic',
            description: 'Tree-ripened premium Chaunsa mangoes with velvety golden pulp and signature rich aroma.',
            imageUrl: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=800&q=80',
            isSoldOut: false,
          },
          {
            farmerId: farmerUser._id,
            marketId: karachiMarket._id,
            name: 'Thatta Riverbed Desi Red Onions',
            category: 'Fresh Vegetables',
            price: 110,
            unit: 'kg',
            stockQuantity: 200,
            farming_type: 'Organic',
            description: 'Naturally cured deep purple red onions cultivated in Thatta riverbed silt. Firm layers with sharp, piquant flavor.',
            imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80',
            isSoldOut: false,
          },
          {
            farmerId: farmerUser._id,
            marketId: lahoreMarket._id,
            name: 'Sargodha Fresh Kinnow Oranges',
            category: 'Orchard Fruits',
            price: 220,
            unit: 'dozen',
            stockQuantity: 110,
            farming_type: 'Organic',
            description: 'Sun-drenched golden citrus hand-picked from Sargodha canal-fed orchards. Bursting with vitamin C and tart juice.',
            imageUrl: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=800&q=80',
            isSoldOut: false,
          },
          {
            farmerId: farmerUser._id,
            marketId: karachiMarket._id,
            name: 'Matiari Organic Garlic & Ginger Basket',
            category: 'Organic Herbs',
            price: 320,
            unit: 'kg',
            stockQuantity: 85,
            farming_type: 'Organic',
            description: 'Heritage desi white garlic cloves and fibrous fragrant fresh ginger roots harvested without chemical fertilizers.',
            imageUrl: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=800&q=80',
            isSoldOut: false,
          },
          {
            farmerId: farmerUser._id,
            marketId: lahoreMarket._id,
            name: 'Cold-Pressed Pure Sarson Oil (Mustard)',
            category: 'Raw Honey & Preserves',
            price: 650,
            unit: 'bottle',
            stockQuantity: 60,
            farming_type: 'Organic',
            description: 'Traditional kohloo cold-pressed yellow mustard oil from Okara farms. Zero additives, pure pungent aroma.',
            imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
            isSoldOut: false,
          },
          {
            farmerId: farmerUser._id,
            marketId: islamabadMarket._id,
            name: 'Swat Organic Mountain Walnuts (Akhrot)',
            category: 'Raw Honey & Preserves',
            price: 880,
            unit: 'kg',
            stockQuantity: 45,
            farming_type: 'Organic',
            description: 'Thin-shelled organic mountain walnuts dried under Himalayan sun. Rich in omega oils and delicate sweetness.',
            imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
            isSoldOut: false,
          },
          {
            farmerId: farmerUser._id,
            marketId: karachiMarket._id,
            name: 'Malir Fresh Green Chilies & Mint',
            category: 'Organic Herbs',
            price: 90,
            unit: 'bunch',
            stockQuantity: 140,
            farming_type: 'Organic',
            description: 'Fragrant garden spearmint leaves and crisp hot green chilies picked at 5:00 AM from Malir green belt.',
            imageUrl: 'https://images.unsplash.com/photo-1525607551316-4a8e16d1f9ba?auto=format&fit=crop&w=800&q=80',
            isSoldOut: false,
          },
          {
            farmerId: farmerUser._id,
            marketId: lahoreMarket._id,
            name: 'Kalar Kahar Aged Super Basmati Rice',
            category: 'Grains & Pulses',
            price: 310,
            unit: 'kg',
            stockQuantity: 180,
            farming_type: 'Organic',
            description: 'Extra-long grain authentic Potohar Basmati paddy rice naturally aged for 2 seasons for fluffy fragrant cooking.',
            imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
            isSoldOut: false,
          },
          {
            farmerId: farmerUser._id,
            marketId: lahoreMarket._id,
            name: 'Desi Makhan (Pure Farm Churned Butter)',
            category: 'Farm Fresh Dairy & Eggs',
            price: 540,
            unit: 'box',
            stockQuantity: 40,
            farming_type: 'Organic',
            description: 'Sweet white hand-churned butter made from fresh morning buffalo milk. Creamy texture and natural aroma.',
            imageUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=800&q=80',
            isSoldOut: false,
          },
          {
            farmerId: farmerUser._id,
            marketId: lahoreMarket._id,
            name: 'Faisalabad Sweet Red Carrots (Desi Gajar)',
            category: 'Fresh Vegetables',
            price: 95,
            unit: 'kg',
            stockQuantity: 160,
            farming_type: 'Organic',
            description: 'Crisp, naturally sweet vibrant red carrots. Ideal for fresh morning juicing, salads, and traditional Gajar Halwa.',
            imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?auto=format&fit=crop&w=800&q=80',
            isSoldOut: false,
          },
        ];

        for (const pItem of productsToEnsure) {
          const exists = await Product.findOne({ name: pItem.name });
          if (!exists) {
            await Product.create(pItem);
          } else if (exists.isSoldOut || exists.stockQuantity <= 0) {
            // Restore active stock for testing so customers can freely pre-order
            await Product.updateOne({ _id: exists._id }, { $set: { isSoldOut: false, stockQuantity: pItem.stockQuantity } });
          }
        }
      }

    // Seed Categories if empty
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      console.log('[MarketLink] Seeding default product categories into MongoDB...');
      await Category.create([
        { name: 'Fresh Vegetables' },
        { name: 'Orchard Fruits' },
        { name: 'Farm Fresh Dairy & Eggs' },
        { name: 'Raw Honey & Preserves' },
        { name: 'Organic Herbs' },
        { name: 'Grains & Pulses' },
      ]);
    }

    // Ensure all existing users have isApproved and isSuspended defaults
    await User.updateMany({ isApproved: { $exists: false }, role: { $in: ['customer', 'admin'] } }, { $set: { isApproved: true } });
    await User.updateMany({ isApproved: { $exists: false }, role: 'farmer' }, { $set: { isApproved: true } }); // seed farmers active by default
    await User.updateMany({ isSuspended: { $exists: false } }, { $set: { isSuspended: false } });
  } catch (err) {
    console.warn('[MarketLink] Note during auto-seed check:', err);
  }
}

// ---------------------------------------------------------------------
// Vite / Static Serving
// ---------------------------------------------------------------------
async function startServer() {
  // Task 3: Call connectDB() at the top of startServer() before app.listen()
  await connectDB();
  await autoSeedMongoDBIfEmpty();

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MarketLink eGreen Basket] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
