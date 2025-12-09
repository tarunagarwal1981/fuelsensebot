# FuelSense Bot

A Next.js 14 Teams chatbot application for maritime fuel analysis and cargo optimization. This application provides role-based views for different stakeholders in the maritime industry to analyze cargo routes, calculate fuel requirements, and optimize bunkering decisions.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fuelsensebot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 👥 Demo Credentials (Roles)

The application supports four different roles, each with unique functionality:

### 1. **Charterer**
- **Purpose**: Fix cargo and compare profitability
- **Features**:
  - Side-by-side cargo comparison
  - "Fix Cargo" button on viable options
  - Net profit emphasis
  - Best option highlighting

### 2. **Operator**
- **Purpose**: Book bunkers and manage operations
- **Features**:
  - View fixed cargo (after charterer decision)
  - "Book Bunker" button
  - All available bunker ports with pricing
  - Port agent contact information

### 3. **Vessel**
- **Purpose**: Verify ROBs and update position
- **Features**:
  - Read-only analysis cards
  - "Verify ROBs" button
  - Vessel position map
  - ETA updates

### 4. **Vessel Manager**
- **Purpose**: Fleet overview and strategic metrics
- **Features**:
  - Fleet dashboard with key metrics
  - Total bunker spend tracking
  - Efficiency calculations
  - Unverified data alerts

## 🎯 Demo Workflow

1. **Start as Charterer**:
   - Click "Load Example" to populate sample cargoes
   - Review both cargo analyses side-by-side
   - Click "Fix Cargo" on the best option (highest net profit)

2. **Switch to Operator**:
   - View the fixed cargo
   - Review bunker port options
   - Click "Book Bunker" to confirm booking

3. **Switch to Vessel**:
   - View vessel position on map
   - Click "Verify ROBs" to confirm fuel levels
   - Review read-only analysis

4. **Switch to Vessel Manager**:
   - View fleet overview metrics
   - Review strategic KPIs
   - Monitor unverified data alerts

## 📦 Features

- ✅ **Streaming Analysis**: Real-time analysis with status updates
- ✅ **Role-Based Views**: Different interfaces for each stakeholder
- ✅ **Responsive Design**: Works on desktop and mobile
- ✅ **Error Handling**: Graceful failures with retry functionality
- ✅ **Smooth Animations**: Fade-in effects and transitions
- ✅ **Loading States**: Skeleton loaders during analysis
- ✅ **Demo Data Presets**: Quick example loading

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Deployment**: Netlify-ready

## 📝 Project Structure

```
fuelsensebot/
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts      # Streaming analysis endpoint
│   ├── globals.css           # Global styles and animations
│   ├── layout.tsx             # Root layout
│   └── page.tsx              # Main page with role views
├── components/
│   ├── AnalysisCard.tsx      # Analysis display card
│   ├── FleetOverview.tsx     # Fleet metrics dashboard
│   ├── RoleSelector.tsx      # Role selection component
│   ├── SkeletonLoader.tsx    # Loading skeleton
│   ├── StreamingStatus.tsx   # Streaming status indicator
│   └── VesselPositionMap.tsx  # Vessel position map
├── lib/
│   ├── agents.ts             # Agent logic and analysis
│   ├── dummyData.ts          # Realistic maritime data
│   └── types.ts              # TypeScript type definitions
└── README.md
```

## 🚢 Deployment to Netlify

### Option 1: Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build the project**
   ```bash
   npm run build
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod
   ```

### Option 2: Git Integration

1. **Push to GitHub/GitLab**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [Netlify](https://www.netlify.com)
   - Click "New site from Git"
   - Select your repository
   - Build settings are auto-detected from `netlify.toml`

3. **Deploy**
   - Netlify will automatically build and deploy

### Build Settings (Auto-configured)

The `netlify.toml` file includes:
- Build command: `npm run build`
- Publish directory: `.next`
- Node version: 18.x

## 🧪 Testing Locally

1. **Test build**
   ```bash
   npm run build
   npm start
   ```

2. **Check for errors**
   - Review console for any build warnings
   - Test all role views
   - Verify streaming analysis works
   - Test responsive design

## 📊 Sample Data

The application includes realistic maritime data:
- **Vessel Position**: North Sea → Rotterdam
- **Current ROB**: VLSFO: 180 MT, LSMGO: 45 MT (unverified)
- **Consumption Profile**: Sea VLSFO: 28 MT/day, LSMGO: 2 MT/day
- **Sample Cargoes**:
  - Rotterdam → Singapore ($850k freight)
  - Rotterdam → US East Coast ($620k freight)
- **Bunker Ports**: Rotterdam, Gibraltar, Fujairah, Panama

## 🐛 Troubleshooting

### Build Errors
- Ensure Node.js 18+ is installed
- Clear `.next` folder and rebuild: `rm -rf .next && npm run build`

### Streaming Not Working
- Check browser console for errors
- Verify API route is accessible
- Check network tab for SSE connection

### Styling Issues
- Clear browser cache
- Rebuild Tailwind: `npm run build`

## 📄 License

This project is a demo application for maritime fuel analysis.

## 🤝 Contributing

This is a demo project. For production use, consider:
- Adding authentication
- Connecting to real APIs
- Implementing database storage
- Adding more comprehensive error handling

---

**Built with ❤️ for maritime operations**

