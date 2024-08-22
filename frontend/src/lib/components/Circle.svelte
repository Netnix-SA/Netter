<script lang="ts">
    let { value }: { value: number } = $props();
</script>

<svg viewBox="-16 -16 64 64" class="circular-progress size-10" style="--progress: {value}">
    <circle class="bg"></circle>
    <circle class="fg green-light"></circle>
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
  }

  @property --progress {
    syntax: "<number>";
    inherits: false;
    initial-value: 0;
  }
</style>
