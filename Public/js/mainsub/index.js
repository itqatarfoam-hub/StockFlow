// ============================================
// STOCKFLOW - MAINSUB MODULES INDEX
// Central loader for all mainsub modules
// ============================================

/**
 * This file ensures all mainsub modules are loaded in the correct order.
 * Include this file BEFORE main.js in your HTML.
 * 
 * Usage in index.html:
 * <script src="js/mainsub/index.js"></script>
 * <script src="js/main.js"></script>
 */

console.log('📦 Loading StockFlow Sub-Modules...');

// Load utilities first (no dependencies)
const moduleScripts = [
    '/js/mainsub/utilities.js',
    '/js/mainsub/data.loaders.js',
    '/js/mainsub/ui.renderer.js',
    '/js/mainsub/auth.handler.js',
    '/js/mainsub/events.manager.js'
];

// Function to load scripts sequentially
function loadModules(scripts, index = 0) {
    if (index >= scripts.length) {
        console.log('✅ StockFlow Sub-Modules loaded successfully!');
        // Dispatch custom event when all modules are loaded
        window.dispatchEvent(new Event('stockflow-modules-loaded'));
        return;
    }

    const script = document.createElement('script');
    script.src = scripts[index];
    script.onload = () => {
        console.log(`  ✓ Loaded: ${scripts[index]}`);
        loadModules(scripts, index + 1);
    };
    script.onerror = () => {
        console.error(`  ✗ Failed to load: ${scripts[index]}`);
        loadModules(scripts, index + 1);
    };
    document.head.appendChild(script);
}

// Start loading modules
loadModules(moduleScripts);
