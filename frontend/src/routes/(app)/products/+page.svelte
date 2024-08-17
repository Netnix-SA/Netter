<script lang="ts">
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
</script>

<div class="flex-1 flex flex-col w-full divide-y">
	<header class="flex w-full px-6 h-10 items-center text-sm">
		My products
	</header>
	<main>
		<ul class="divide-y">
			{#each data.products as product}
				<li class="px-6 py-2 flex items-center last:border-b tactile-dark">
					<a href={`/products/${product.id}`} class="flex-1">
						<span class="text-xs font-medium tactile-text">
							{product.name}
						</span>
					</a>
					<div class="gallery gap-2">
						<!-- <span class="text-xs text-muted-foreground">Lead</span> -->
						<!-- <UserAvatar full_name={data.users.find(u => u.id === project.lead)?.full_name}/> -->
					</div>
				</li>
			{/each}
		</ul>
	</main>
</div>