# Cloud Accountant

A cloud-based accounting system for UK sole traders and landlords, providing comprehensive financial management with multi-currency support, Excel data extraction, and Making Tax Digital (MTD) ITSA compliance.

## Features

- **Simple Dashboard** - Monitor your financial health at a glance with intuitive charts and metrics
- **Multi-Currency Support** - Handle transactions in multiple currencies with automatic conversion
- **Excel Data Import** - Quickly import your financial data from Excel spreadsheets
- **Tax Reporting** - Generate and submit tax reports compliant with HMRC's Making Tax Digital requirements
- **Transaction Management** - Track income and expenses with customizable categories
- **Secure Cloud Storage** - Your financial data is safely stored in the cloud and accessible from anywhere

## Technology Stack

- **Frontend**: React with TypeScript and Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: Cloudflare D1 (SQLite-compatible)
- **Deployment**: Cloudflare Workers for global edge deployment

## Development

### Prerequisites

- Node.js v20 or higher
- npm v9 or higher

### Local Development

1. Clone the repository
   ```
   git clone https://github.com/your-username/cloud-accountant.git
   cd cloud-accountant
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   npm run dev
   ```

4. Open your browser and navigate to http://localhost:5000

## Deployment

This project is configured for deployment to Cloudflare Workers using GitHub Actions. The CI/CD pipeline automatically:

1. Builds the frontend and backend
2. Deploys the application to Cloudflare Workers
3. Sets up the database with the initial schema

### Required Secrets

To enable the CI/CD pipeline, add the following secrets to your GitHub repository:

- `CLOUDFLARE_API_TOKEN` - An API token with Workers and D1 permissions
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID
- `CLOUDFLARE_ZONE_ID` - The zone ID of your domain

## License

This project is licensed under the MIT License - see the LICENSE file for details.