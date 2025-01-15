<script lang="ts">
    import { client } from "@/state";
	import type { PageData } from "./$types";
    import Channel from "@/components/channels/Channel.svelte";

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.channel.name}</title>
</svelte:head>

<div id="chat" class="flex-1 h-full flex flex-col">
	{data.channel.name}
	<Channel channel={data.channel} messages={data.messages} users={data.users}/>
</div>