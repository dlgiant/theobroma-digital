# Theobroma Digital

A comprehensive cocoa plantation analytics dashboard built with Next.js, featuring real-time spatial data visualization and multilingual support for cocoa farm management.

## 🌿 Features

### Analytics Dashboard
- **Interactive Chart Selector**: Choose from various cocoa-specific metrics including security events, maturity index, fungal threat, canopy grading, tree age, and tree density
- **Dynamic Data Insights**: Real-time analytics computed from plantation data including tree counts, average health metrics, and threat assessments
- **Responsive Design**: Fully responsive interface that adapts to different screen sizes and sidebar states

### Spatial Visualization
- **Tree Map Visualization**: Interactive 2D map showing tree locations with color-coded health indicators
- **Trail Network**: Visualization of walking trails between trees with connection mapping
- **Custom Tooltips**: Rich, interactive tooltips displaying detailed tree information including coordinates and health metrics
- **Toggle Controls**: Show/hide trails and connections for cleaner visualization
- **Legend & Statistics**: Comprehensive legend and summary statistics for each metric

### Internationalization
- **Multilingual Support**: Full Portuguese (pt-BR) and English (en-US) localization
- **Dynamic Language Switching**: All UI elements, tooltips, and content update based on user's language preference
- **Localized Routes**: URL-based locale routing for better SEO and user experience

### Data Management
- **Synthetic Plantation Data**: Generated dataset with 500 trees and 352 trail points with realistic cocoa farm metrics
- **Network Graph Structure**: Trees connected via trail points with spatial relationships and metadata
- **Performance Optimized**: Efficient data loading and rendering for large datasets

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and yarn
- Python 3.x (for data generation scripts)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd theobroma-digital
```

2. Install dependencies:
```bash
yarn install
```

3. Generate plantation data (optional - data is already included):
```bash
python generate_tree_coordinates.py
python generate_lot_coordinates.py
```

4. Run the development server:
```bash
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the dashboard.

## 📊 Data Structure

The plantation data includes:
- **Trees**: 500 cocoa trees with health metrics (maturity, fungal threat, canopy grading, etc.)
- **Trails**: 352 trail points connecting trees for navigation
- **Connections**: Network graph of trail connections within 15-meter proximity
- **Lots**: Overlapping plantation lots for area management

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Internationalization**: next-intl
- **Icons**: Custom SVG icon system
- **Data Visualization**: Custom React components with SVG rendering
- **Data Generation**: Python scripts for synthetic plantation data

## 🌍 Supported Languages

- 🇺🇸 English (en-US)
- 🇧🇷 Portuguese (pt-BR)

## 📁 Project Structure

```
src/
├── app/[locale]/           # Internationalized pages
├── components/             # React components
│   ├── ChartSelector.tsx   # Metric selection dropdown
│   ├── ChartDisplay.tsx    # Chart content display
│   ├── ChartsSection.tsx   # Chart section wrapper
│   └── TreeMapVisualization.tsx # Spatial map visualization
├── messages/               # Translation files
│   ├── en-US.json         # English translations
│   └── pt-BR.json         # Portuguese translations
public/
├── icons/                 # Custom SVG icons
├── plantation-data.json   # Main plantation dataset (gitignored)
scripts/
├── generate_tree_coordinates.py  # Tree and trail data generation
└── generate_lot_coordinates.py   # Lot boundaries generation
```

## 🔧 Development

### Adding New Metrics
1. Update the chart options in `ChartSelector.tsx`
2. Add corresponding display logic in `ChartDisplay.tsx` and `TreeMapVisualization.tsx`
3. Update translation files with new metric labels
4. Modify data generation scripts if new data fields are needed

### Adding New Languages
1. Create a new translation file in `src/messages/`
2. Update the i18n configuration
3. Add locale-specific routing

## 📈 Performance Considerations

- Data is loaded asynchronously to prevent blocking UI
- Visualization uses efficient SVG rendering with viewport optimization
- Responsive design with debounced resize handlers
- Translation strings are lazy-loaded per locale

## 🚢 Deployment

This project is optimized for deployment on Vercel:

1. Connect your repository to Vercel
2. Ensure `plantation-data.json` is uploaded to your deployment (it's gitignored locally)
3. Deploy with automatic builds on push

Alternatively, build for production:
```bash
yarn build
yarn start
```

## 📄 License

This project is developed for cocoa plantation management and analytics.
