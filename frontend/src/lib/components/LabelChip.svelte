<script lang="ts">
    let { label } = $props();
</script>

<div class="w-20 h-6 flex items-center rounded-lg gap-1 bg-slate-950 overflow-hidden tactile border border-gray-800">
    <div class="h-full flex items-center justify-center w-4 border-r text-[0.6rem]" class:bg-orange-400={label?.color === 'Orange/Light'}>
        {label?.icon}
    </div>
    <span class="truncate flex-1 text-[0.8rem] tactile-text">
        {label?.title}
    </span>
</div>