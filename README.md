
```
██╗███╗   ██╗██████╗ ██╗   ██╗████████╗███╗   ███╗ █████╗ ███╗   ██╗
██║████╗  ██║██╔══██╗██║   ██║╚══██╔══╝████╗ ████║██╔══██╗████╗  ██║
██║██╔██╗ ██║██████╔╝██║   ██║   ██║   ██╔████╔██║███████║██╔██╗ ██║
██║██║╚██╗██║██╔═══╝ ██║   ██║   ██║   ██║╚██╔╝██║██╔══██║██║╚██╗██║
██║██║ ╚████║██║     ╚██████╔╝   ██║   ██║ ╚═╝ ██║██║  ██║██║ ╚████║
╚═╝╚═╝  ╚═══╝╚═╝      ╚═════╝    ╚═╝   ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝
                                                                                            
```

**An easy to use, typed, no-dependency input manager for web applications** 



## Usage/Examples

`inputman` unfortunately currently lacks complete documentation. However, it is relatively intuitive when used with an LSP. In addition, the source-code is pretty small, so if you can't figure out how to do something it should be easy to work out. 

Although the project is built to Javascript with a type declaration file, I would strongly recommend using the project from Typescript. This is because Typescript does not build private fields to # fields, so in Javascript you might accidentally mess with something internal. As always with Javascript, be cautious!

### Basic keyboard callback
This code example will run a callback every time a keydown event happens.
```typescript
const inputMan = new InputMan(window);

inputMan.keyboard.registerCallback(() => {
    console.log("Hello")
}, "keydown")
```

### Simple bindings
```typescript
const inputMan = new InputMan(window);

// Register a consecutive binding (control and c pressed simultaneously)
inputMan.registerBinding("ControlLeft+KeyC", () => {console.log("Binding pressed")});

// Register a sequential binding (control and then c pressed)
inputMan.registerBinding(["ControlLeft", "KeyC"], () => {console.log("Other binding pressed")});
```

### Lock the mouse cursor

```typescript
const inputMan = new InputMan(window);

if(!inputMan.mouse.cursorLocked) {
    inputMan.mouse.lockCursor()
}
```


## Installation

### ESM

Install `inputman` with your favourite npm-compatible package manager.

```bash
npm install inputman
```

### IIFE

The IIFE build is included in the `npm` install, however one can also use it through unpkg (for example).

```html
<script src="https://unpkg.com/inputman/dist/index.global.js">
```
    
## License

`inputman` is licensed under [MIT](https://choosealicense.com/licenses/mit/). However, I kindly request (with no legal threat implied) that any corporate users provide credit outside the source-code. 


## Roadmap

- Work out how to test mouse movement.
- Add expanded controller support (custom layouts).
- Allow combined sequential and consecutive bindings.
- (Maybe) support bindings based on key and not key code.


## Contributing

`inputman` may be a superhero, but sometimes he needs help too! See `contributing.md` for guidelines and how to get started.

