<button>
    Hello
</button>

<style>
    :root {
        --eerie-black: hsla(0, 0%, 12%, 1);
        --night: hsla(0, 0%, 9%, 1);
    }

    button {
        font-weight: bold;
        color: white;
        padding: 1em;
        display: flex;
        align-items: center;
        justify-content: center;
        background-image: linear-gradient(to bottom, hsl(var(--muted)), hsl(var(--background)));
        border: none;
        border-radius: 12px;
        box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.12), 0 2px 6px black;
        cursor: pointer;
        transform: scale(var(--btn-scale));
        position: relative;
        overflow: hidden;
        will-change: transform;
        /* transition: --nb-1-tsy 0.3s ease, --nb-2-tsy 0.3s ease, --nb-1-op 0.15s ease, --nb-2-op 0.15s ease, --ic-op 0.15s ease, --ic-ts-x 0.15s ease; */
    }

    button:hover {
        background-image: linear-gradient(to bottom, hsl(var(--foreground)), hsl(var(--muted)));
    }
</style>