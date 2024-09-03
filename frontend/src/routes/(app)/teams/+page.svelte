<header class="gallery bg-primary-foreground w-full border-b px-4 h-10">
	<div class="gallery flex-1 gap-4">
		<h1 class="tactile-text text-sm">
			My teams
		</h1>
		<!-- <div class="rounded item-background h-6 w-12 frame">
			<a href={`${$page.url}/tasks`} class="text-xs text-center tactile-text">Tasks</a>
		</div> -->
	</div>
	<!-- <Pin pinned={data.user.pinned} id={data.objective.id}/> -->
</header>
<div class="flex-1 flex flex-col w-full divide-y">
	<main class="grid grid-cols-4 gap-8 p-8">
		{#each ["Dev", "Sales"] as team}
			<a href={`/teams/${team}`} class="flex flex-col px-6 py-4 rounded-lg border col-span-1 row-span-1 shadow-md bg-primary-foreground hover:shadow-xl hover:scale-105 transition-all">
				<div id="header" class="w-full flex items-center h-10">
					<span class="flex-1 font-bold">{team}</span>
					<div class="rounded bg-orange-300 flex items-center justify-center aspect-square h-full">
						<span class="drop-shadow">
							🐛
						</span>
					</div>
				</div>
				<div id="body">
					<p class="text-sm text-muted-foreground">Lorem ipsum dolor amet</p>
				</div>
			</a>
		{/each}
	</main>
</div>