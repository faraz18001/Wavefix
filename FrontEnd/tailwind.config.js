/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#6366f1",
                "primary-hover": "#4f46e5",
                "background-dark": "#09090b", // Solid Zinc 950
                "surface-dark": "#18181b", // Solid Zinc 900
                "border-dark": "#27272a", // Zinc 800
                "sidebar-bg": "#000000", // Pure black for sidebar
                "border-subtle": "#27272a", // zinc-800
                "user-bubble": "#172554", // blue-950 (Solid Dark Blue)
                "ai-bubble": "#18181b", // zinc-900 (Subtle Dark Gray)
                "text-main": "#f4f4f5", // zinc-100
                "text-muted": "#a1a1aa", // zinc-400
            },
            fontFamily: {
                "sans": ["Inter", "sans-serif"],
                "display": ["Inter", "sans-serif"],
                "mono": ["JetBrains Mono", "monospace"]
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
    ],
}
