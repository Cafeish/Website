/* =========================================================
   CAFEISH — SITE DATA
   Edit this file to change menu items, team members, and
   journal posts. No HTML editing required for content updates.
   ========================================================= */

// ---- MENU ITEMS ----
// category must be one of: "Drinks", "Bakes", "Food", "Cakes"
const DEFAULT_MENU_ITEMS = [
  { id: "m1", name: "Pakistani Homemade Biryani", category: "Food", price: 0.00, desc: "Served with raita.", img: "" },
  { id: "m2", name: "Lachha Paratha Rolls (Chicken Tikka)", category: "Food", price: 0.00, desc: "Served with green chutney.", img: "" },
  { id: "m3", name: "Lachha Paratha Roll (Vegetarian, Spicy Aloo)", category: "Food", price: 0.00, desc: "Mixed spicy aloo filling, served with green chutney.", img: "" },
  { id: "m4", name: "Crispy Cheese Naan", category: "Food", price: 0.00, desc: "Naan dough, griddle-cooked paratha-style, stuffed with cheese.", img: "" },
  { id: "m5", name: "Mango Float Matcha Latte", category: "Drinks", price: 0.00, desc: "", img: "" },
  { id: "m6", name: "Karak Chai", category: "Drinks", price: 0.00, desc: "", img: "" },
  { id: "m7", name: "Karak Rose Chai", category: "Drinks", price: 0.00, desc: "", img: "" },
  { id: "m8", name: "Dalgona Coffee", category: "Drinks", price: 0.00, desc: "", img: "" },
  { id: "m9", name: "Brown Butter Chocolate Chip Cookies", category: "Bakes", price: 0.00, desc: "", img: "" },
  { id: "m10", name: "Brown Butter Biscoff Cookies", category: "Bakes", price: 0.00, desc: "", img: "" },
  { id: "m11", name: "Scoopable Cookies", category: "Bakes", price: 0.00, desc: "", img: "" },
  { id: "m12", name: "Lemon Blueberry Cake", category: "Cakes", price: 0.00, desc: "With lemon cream cheese icing.", img: "" },
  { id: "m13", name: "Chocolate Cake", category: "Cakes", price: 0.00, desc: "With chocolate cream cheese icing.", img: "" },
  { id: "m14", name: "Basque Cheesecake", category: "Cakes", price: 0.00, desc: "", img: "" }
];

// ---- TEAM MEMBERS ----
// Aisha will provide real photos + bios — swap `img` and `bio` below.
const TEAM_MEMBERS = [
  { name: "Aisha", role: "Founder & Chef", bio: "Cooks like she talks — fast, warm, no filler.", img: "" },
  { name: "Team Member", role: "Role", bio: "Bio coming soon.", img: "" },
  { name: "Team Member", role: "Role", bio: "Bio coming soon.", img: "" }
];

// ---- JOURNAL POSTS ----
const JOURNAL_POSTS = [
  {
    id: "j1",
    title: "Why we don't westernize the menu",
    excerpt: "Every dish on our menu is served the way it's eaten at home — no shortcuts, no substitutions to make it more familiar.",
    date: "2026-07-01",
    img: "",
    featured: true
  },
  {
    id: "j2",
    title: "The first pop-up",
    excerpt: "What we learned setting up in a parking lot in St. Louis with a folding table and 40 orders.",
    date: "2026-06-15",
    img: ""
  },
  {
    id: "j3",
    title: "Sourcing saffron the right way",
    excerpt: "A short note on why we pay more for saffron, and why you can taste the difference.",
    date: "2026-06-02",
    img: ""
  },
  {
    id: "j4",
    title: "Building Cafeish from a home kitchen",
    excerpt: "How a weekend hobby turned into pop-ups across St. Louis and surrounding areas.",
    date: "2026-05-20",
    img: ""
  }
];

// ---- CONTACT INFO (used on Order page) ----
const CONTACT_INFO = {
  email: "cafeish.team@gmail.com",
  phone: "(314) 555-0142",
  instagram: "@cafeish",
  cateringNote: "For catering and pop-up bookings, tell us your date, headcount, and location."
};

// ---- THEME (decorations: colors + font) ----
// These are Aisha's exact values from the brief. Changed via /admin.html's
// Theme tab — that writes to Firestore (or this browser in demo mode) and
// overrides these at runtime, so you never have to hand-edit this file
// just to try a color.
const DEFAULT_THEME = {
  bg: "#2A0A0A",
  surface: "#380E0E",
  nav: "#4A1515",
  text: "#EDE0CC",
  muted: "#C9B99A",
  gold: "#C9974A",
  font: "Comfortaa",
  logo: "images/cafeish-logo-nav.png"
};

// Curated so every option stays readable on a dark background.
const FONT_OPTIONS = [
  { name: "Comfortaa", stack: "'Comfortaa', sans-serif", url: "https://fonts.googleapis.com/css2?family=Comfortaa:wght@300..700&display=swap" },
  { name: "Quicksand", stack: "'Quicksand', sans-serif", url: "https://fonts.googleapis.com/css2?family=Quicksand:wght@300..700&display=swap" },
  { name: "Poppins", stack: "'Poppins', sans-serif", url: "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" },
  { name: "Playfair Display", stack: "'Playfair Display', serif", url: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap" },
  { name: "Cormorant Garamond", stack: "'Cormorant Garamond', serif", url: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&display=swap" }
];
