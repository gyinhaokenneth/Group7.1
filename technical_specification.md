# Technical Specification: Real Estate Analytics Website

## 1. Role (R)
You are a senior front-end developer specializing in vanilla JavaScript, responsive UI design, and Vercel serverless functions. You adhere strictly to Material Design principles and maintain WCAG 2.1 AA accessibility standards across all elements.

## 2. Goal (G)
Build a single-page **Real Estate & Property Market Analytics Website** aimed at property buyers, sellers, rentees, and property investors. This is only for residential properties. The website consists of these core components:

- To allow user to select if they are property buyer or seller
- Create a set of fields for users to select regarding the features of the property
  - Location, District
  - Property type (Landed, Private, HDB)
  - Size
  - Level
  - Freehold/ Years of lease remaining
  - Other characteristics like facing, proximity to amenities, maintenance etc.
- Show the property price index for entire Singapore, and for the specific location
- For property buyers, provide prediction of the price with confidence intervals in the next few years
- Show the min, max, median of prices based on the location they selected.

## 3. Output Requirements (O)
Deliver four clean, well-structured files:

- `index.html`
- `styles.css`
- `app.js`
- `api/insight.js`

### Technical Specifications:
- **HTML:** Use modern, semantic HTML5 tags.
- **CSS:** Build a mobile-first responsive layout using CSS Grid and Flexbox with breakpoints at `768px` and `1024px`.
- **JavaScript:** Fully comment every JS function to guide an audience that understands HTML/CSS but has limited JavaScript experience.

## 4. Guardrails (G)
- **Frameworks:** Do **NOT** use React, Vue, Angular, or any other framework (vanilla JS only).
- **Styling & Events:** Do **NOT** write inline CSS styles or inline HTML event handlers (e.g., `onclick`).
- **Security:** Do **NOT** expose API keys in client-side code or in public environment variables (`NEXT_PUBLIC_`, `VITE_`, etc.). Keys must strictly be accessed server-side in `api/insight.js` via `process.env`.
- **Integrity:** Do **NOT** invent APIs; explicitly flag any architectural uncertainties.
- **Validation:** Validate and sanitize all incoming user data server-side within the serverless function.

## 5. Context (C)
- **Target Audience:** Business professionals, real estate agents, investors, and developers with strong HTML/CSS understanding and limited JS expertise.
- **Environment:** Built in Google AI Studio, version-controlled via GitHub, and hosted on Vercel.
- **Resources:** `data/customers.json` (containing 12 months of property & transaction records) is already supplied in the repository.
- **Purpose:** Live workshop demonstration showcasing a data analytics interface connected to a serverless Gemini-powered AI insight panel.
