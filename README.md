# Production Monitoring System

A production-ready web/mobile Progressive Web App (PWA) for tracking production plan vs actual performance with real-time calculations and local SQLite database.

## Features

- 📊 **Real-time Production Tracking** - Monitor hourly production against planned targets
- 📱 **Mobile-Optimized** - Fully responsive design with PWA capabilities
- 💾 **Local SQLite Database** - Full-featured SQLite database running in the browser
- 🔒 **Offline First** - Works completely offline, no internet required
- 📈 **Live Calculations** - Automatic calculation of metrics, variance, and productivity rates
- 🎨 **Modern UI** - Clean, intuitive interface with gradient design
- ⚡ **Fast Performance** - Built with React + TypeScript + Vite
- 💿 **Data Export/Import** - Export and import your database for backup

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **State Management**: Zustand
- **Database**: SQL.js (SQLite in browser via WebAssembly)
- **Build Tool**: Vite
- **PWA**: vite-plugin-pwa with Workbox
- **Styling**: Custom CSS with mobile-first responsive design

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` folder, ready to deploy to any static hosting service.

### Preview Production Build

```bash
npm run preview
```

## Deployment Options

### Vercel (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

### Netlify
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

### Other Hosting
Deploy the `dist` folder to any static hosting service:
- GitHub Pages
- Cloudflare Pages
- Firebase Hosting
- AWS S3 + CloudFront

## Usage

1. **Setup Information**
   - Enter production line name
   - Select date
   - Input daily plan target and achievement factor
   - Configure manpower requirements

2. **Time & Manpower Settings**
   - Set start/end times
   - Configure break time
   - Adjust manpower values

3. **Generate Tracking**
   - Click "Calculate Metrics" to see calculated values
   - Click "Generate Time Table" to create hourly tracking slots
   - Edit time slots and actual production values inline
   - Real-time calculations update automatically

4. **Save & Track**
   - Click "Save Session" to store data (cloud or local)
   - View summary statistics
   - Reset form for new tracking session

## App Features

### Offline Capability
The app works 100% offline using:
- Service Worker for caching assets
- SQLite database running entirely in the browser (WebAssembly)
- All data stored in browser localStorage
- No internet connection required after initial load

### Mobile PWA
Install on mobile devices:
- **iOS**: Safari → Share → Add to Home Screen
- **Android**: Chrome → Menu → Install App

### Data Persistence
- **Local SQLite Database**: Full-featured SQLite database stored in browser localStorage
- **Automatic Saving**: Database automatically persists after every operation
- **Export/Import**: Export database to file for backup or transfer between devices

## Project Structure

```
src/
├── components/        # React components
│   ├── Header.tsx
│   ├── SetupForm.tsx
│   ├── MetricsDisplay.tsx
│   ├── TimeTable.tsx
│   └── Summary.tsx
├── services/         # Database and API services
│   └── database.ts
├── store/           # Zustand state management
│   └── productionStore.ts
├── types/           # TypeScript type definitions
│   └── index.ts
├── App.tsx          # Main app component
├── App.css          # Global styles
└── main.tsx         # App entry point
```

## Configuration

### Database Schema

The app automatically creates these tables in the local SQLite database:

**production_sessions**
- Session metadata (line, date, targets, manpower)
- Calculated metrics (total time, hourly target, tact time)
- Timestamps

**time_slots**
- Hourly tracking data
- Plan vs actual values
- Variance and productivity calculations

### Database Storage

- Database is stored in browser localStorage as binary data
- Automatic persistence after every write operation
- Export functionality allows backup to file
- Import functionality allows restoration from backup
- No size limits beyond browser's localStorage quota (typically 5-10MB)

## Troubleshooting

### Database Not Persisting
- Check browser's localStorage is enabled
- Ensure you're not in private/incognito mode
- Check browser storage quota hasn't been exceeded
- Try exporting database and clearing browser data, then importing

### PWA Not Installing
- Ensure HTTPS is enabled in production
- Check browser console for service worker errors
- Clear browser cache and try again

### Build Errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Ensure Node.js version is 18+

## License

ISC

## Support

For issues or questions, please open an issue in the repository.
