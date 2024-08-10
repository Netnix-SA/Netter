<script lang="ts">
    let { label } = $props();
</script>

<div class="w-20 h-6 flex items-center rounded-md gap-1 bg-slate-950 overflow-hidden item-background">
    <div class="h-full flex items-center justify-center w-5 border-r text-[0.6rem]" class:bg-orange-400={label?.color === 'Orange/Light'} style="box-shadow:inset rgba(0, 0, 0, 0.3) 0px 0px 8px">
        {label?.icon}
    </div>
    <span class="truncate flex-1 text-[0.8rem] tactile-text">
        {label?.title}
    </span>
</div>