<script lang="ts">
	import UserAvatar from "@/components/UserAvatar.svelte";
	import { COLORS } from "@/utils.ts";
	import { client } from "@/state";

	const data = client.api.users.me.get();
</script>

<main class="column gap-16 p-16">
	<section class="column w-full gap-4">
		<h1 class="text-4xl tactile-text">Settings</h1>
	</section>
	<section class="column w-full gap-4">
		<h2 class="text-2xl tactile-text">Profile</h2>
		<div class="column gap-4 border rounded-lg px-6 py-4 justify-between">
			{#await data then { data: user }}
				<!-- <UserAvatar user={{ id: "tex", full_name: user.full_name, color: user.color }}/> -->
				<div class="gallery">
					<h2 class="tactile-text text-2xl min-w-48">
						Full Name: &nbsp;
					</h2>
					<input class="tactile-text text-2xl" type="text" value={user.full_name} oninput={(e) => user.full_name = e.target.value} onblur={async (e) => await client.api.users.me.patch({ full_name: e.target.value })}/>
				</div>
				<div class="gallery">
					<h2 class="tactile-text text-2xl min-w-48">
						Color: &nbsp;
					</h2>
					<select class="bg-transparent rounded-lg border px-2 h-10" onchange={async (e) => await client.api.users.me.patch({ color: e.target.value })}>
						{#each COLORS as color}
							<option value={color.name}>{color.name}</option>
						{/each}
					</select>
				</div>
			{/await}
		</div>
	</section>
	<section class="column w-full gap-4">
		<h2 class="text-2xl tactile-text">Integrations</h2>
		<div class="gallery gap-4 border rounded-lg h-24 px-6 py-4 justify-between">
			<h2 class="tactile-text text-2xl">
				GitHub
			</h2>
			<button class="gallery item-background h-10 w-32 rounded justify-evenly">
				<span class="tactile-text font-medium">Connect</span>
				<div class="size-2 rounded-full green-light bg-white"></div>
			</button>
		</div>
	</section>
</main>
