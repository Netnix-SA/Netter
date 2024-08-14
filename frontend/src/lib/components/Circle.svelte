<script lang="ts">
    let { value }: { value: number } = $props();
</script>

<svg viewBox="-8 -8 48 48" class="circular-progress size-8" style="--progress: {value}">
    <circle class="bg"></circle>
    <circle class="fg"></circle>
</svg>

<style>
  .circular-progress {
    --size: 32px;
    --half-size: calc(var(--size) / 2);
    --stroke-width: 3px;
    --radius: calc((var(--size) - var(--stroke-width)) / 2);
    --circumference: calc(var(--radius) * pi * 2);
    --dash: calc((var(--progress) * var(--circumference)) / 100);
  }
  
  .circular-progress circle {
    cx: var(--half-size);
    cy: var(--half-size);
    r: var(--radius);
    stroke-width: var(--stroke-width);
    fill: none;
    stroke-linecap: round;
  }
  
  .circular-progress circle.bg {
    stroke: gray;
  }
  
  .circular-progress circle.fg {
    transform: rotate(-90deg);
    transform-origin: var(--half-size) var(--half-size);
    stroke-dasharray: var(--dash) calc(var(--circumference) - var(--dash));
    transition: stroke-dasharray 0.3s cubic-bezier(0.075, 0.82, 0.165, 1) 0s;
    stroke: white;
    filter: drop-shadow(0px 0px 12px rgba(0, 255, 163, 1)) drop-shadow(0px 0px 6px rgba(0, 255, 163, 1)) drop-shadow(0px 0px 2px rgba(0, 255, 163, 1));
  }
  
  @property --progress {
    syntax: "<number>";
    inherits: false;
    initial-value: 0;
  }
</style>