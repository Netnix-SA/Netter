<script lang="ts">
	import * as ContextMenu from "$lib/components/ui/context-menu";
    import MessageBody from "../MessageBody.svelte";

	let { message }: { message: { id: string, author: { id: string }; body: string, resolved?: boolean, question?: string, } } = $props();
</script>

<ContextMenu.Root>
	<ContextMenu.Trigger class="flex-1 gallery px-4 py-2 gap-2">
		<!-- {#if message.question !== undefined}
			<ChevronRight class="size-4"/>
		{/if} -->
		<div id="left-col" class="flex flex-col h-full pt-2">
			<!-- <UserAvatar {user}/> -->
		</div>
		<div id="right-side" class="flex-1 flex flex-col">
			<div class="gallery gap-2">
				<span class="text-sm font-semibold">
					<!-- {user?.full_name} -->
					My Name
				</span>
				<span class="text-xs text-muted-foreground">
					<!-- {message.created_at} -->
					Just now
				</span>
				{#if message.resolved !== undefined}
					<div class="frame rounded-full w-20 border text-xs h-5">
						<span class="select-none" style={message.resolved ? "filter: drop-shadow(0px 0px 12px rgba(0, 255, 163, 1)) drop-shadow(0px 0px 6px rgba(0, 255, 163, 1));" : "filter: drop-shadow(0px 0px 12px rgba(255, 60, 25, 1)) drop-shadow(0px 0px 6px rgba(255, 60, 25, 1)) drop-shadow(0px 0px 2px rgba(255, 60, 25, 1));"}>{message.resolved ? "Resolved" : "Unresolved"}</span>
					</div>
				{/if}
			</div>
			{#if message.question !== undefined}
				<div class="gallery gap-1">
				<span class="text-sm text-muted-foreground">
					Replying to:
				</span>
				<span class="text-sm text-muted-foreground">
					{message.question}
				</span>
				</div>
			{/if}
			<MessageBody body={message.body}/>
		</div>
	</ContextMenu.Trigger>
	<ContextMenu.Content>
		<!-- <ContextMenu.Item onclick={() => { question = message; }}>Reply to</ContextMenu.Item>
		<ContextMenu.Item onclick={async () => await addToDo(message.body)}>Add to ToDo's</ContextMenu.Item>
		{#if message.resolved !== undefined}
			<ContextMenu.Item onclick={() => { question = message; }}>Mark as resolved</ContextMenu.Item>
		{/if} -->
	</ContextMenu.Content>
</ContextMenu.Root>