# CSS Architecture - Money Game

This directory contains the modular CSS structure for the Money Game application. The CSS has been split into logical modules for better maintainability and organization.

## File Structure

### `index.css`

The main entry point that imports all other CSS modules in the correct order.

### `variables.css`

- CSS custom properties (CSS variables)
- Theme definitions for light and dark modes
- Color palette, shadows, border radius, and transition values
- **Always imported first** to ensure variables are available to all other modules

### `base.css`

- Global styles and resets
- Root element styles (html, body, #root)
- Typography definitions (h1, h2, h3, p)
- Base container styles
- Background animations

### `components.css`

- Shared component styles used across multiple screens
- Content sections (setup-section, lobby-container, playing-container, etc.)
- Button styles (primary, secondary, accent variants)
- Form elements and inputs
- Message components (error messages, waiting messages)
- Box headers with accent lines

### `lobby.css`

- Lobby-specific styles
- Players list and player items
- Player tags (host, you indicators)
- Waiting screen components
- Player status indicators

### `game.css`

- Playing screen specific styles
- Game header and player info sections
- Donation interface and donation rows
- Received messages table structure
- Input styling for donations
- Dark mode specific overrides for game elements

### `ui.css`

- UI component styles
- Corner buttons (theme toggle, info button)
- Modal components (How to Play modal)
- Splash screen and animations
- Mobile responsive adjustments

## Import Order

The import order in `index.css` is critical:

1. **Variables** - Must be first so all other files can use CSS custom properties
2. **Base** - Global styles and typography
3. **Components** - Shared component styles
4. **Lobby** - Screen-specific styles
5. **Game** - Screen-specific styles
6. **UI** - Overlay and modal components

## Theme System

The CSS uses CSS custom properties for theming:

- Light theme defined in `:root`
- Dark theme defined in `[data-theme="dark"]`
- Theme switching handled by JavaScript setting the `data-theme` attribute

## Maintenance Guidelines

### Adding New Styles

- **Global styles**: Add to `base.css`
- **Reusable components**: Add to `components.css`
- **Screen-specific styles**: Add to the appropriate screen file (`lobby.css`, `game.css`)
- **UI overlays/modals**: Add to `ui.css`
- **New theme colors**: Add to `variables.css`

### Naming Conventions

- Use kebab-case for class names
- Prefix screen-specific classes with the screen name when needed
- Use semantic names over visual descriptions
- Group related styles together with CSS comments

### Dark Mode

- Define base styles in the main rule
- Override only colors/shadows in `[data-theme="dark"]` blocks
- Test both themes when making changes

## Benefits of This Structure

1. **Maintainability**: Easy to find and modify specific styles
2. **Modularity**: Changes to one screen don't affect others
3. **Performance**: CSS can be optimized and potentially code-split in the future
4. **Collaboration**: Multiple developers can work on different modules
5. **Debugging**: Easier to identify which file contains specific styles
6. **Consistency**: Shared variables ensure consistent theming
