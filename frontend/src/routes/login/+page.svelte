<script lang="ts">
    import { onMount } from 'svelte';
	import type { PageData } from './$types';
    import { error } from '@sveltejs/kit';
    import { goto } from '$app/navigation';
    import Button from '@/components/ui/button/button.svelte';
    import { Github, GithubIcon, Key } from 'lucide-svelte';

	const websocket = new WebSocket("ws://localhost:3000");

	websocket.onopen = (ws) => {
		console.log("Opened WebSocket connection!");
	};

	websocket.onmessage = (message) => {
		console.log(message);
	};

	onMount(async () => {
		if(!PublicKeyCredential || !(await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()) || !(await PublicKeyCredential.isConditionalMediationAvailable())) {
			throw error(500, "Browser does not support passkeys, which are required by Netter.");
		}

		
	});

	const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
		challenge: new ArrayBuffer(4096),
		rp: {
			name: "Example",
			id: "example.com",
		},
		user: {
			id: new ArrayBuffer(1024),
			name: "john78",
			displayName: "John",
		},
		pubKeyCredParams: [{alg: -7, type: "public-key"},{alg: -257, type: "public-key"}],
		excludeCredentials: [{
			id: new ArrayBuffer(1024),
			type: 'public-key',
			transports: ['internal'],
		}],
		authenticatorSelection: {
			authenticatorAttachment: "platform",
			requireResidentKey: true,
		}
	};

	async function handleLogin() {
		const credential = await navigator.credentials.create({
			publicKey: publicKeyCredentialCreationOptions
		});

	}

	async function handleGitHubLogin() {
		await goto(`https://github.com/login/oauth/authorize?client_id=${"Iv23liZcfAnKGoZTUyJs"}&redirect_uri=${"http://localhost/auth/github"}&scope=user`);
	}
</script>

<main class="h-screen w-screen bg-background frame">
	<div class="px-64">
		<h1 class="text-9xl tactile-text font-bold italic">
			Netter
		</h1>
	</div>
	<form action="/login" method="post" target="_blank" class="flex flex-col rounded-3xl border h-[42em] w-96 px-8 py-12 bg-primary-foreground">
		<span class="font-medium font-800 text-2xl text-slate-200">
			Login
		</span>
		<div class="flex-1 column">
			<input name="email" type="email" class="border rounded-lg bg-transparent h-10"/>
		</div>
		<div class="frame flex-col w-full gap-2">
			<Button variant="default" href={`https://github.com/login/oauth/authorize?client_id=${"Iv23liZcfAnKGoZTUyJs"}&redirect_uri=${"http://localhost/auth/github"}&scope=user`} class="gap-2">
				<Key class="size-4"/>
				Login with PassKey
			</Button>
			<Button variant="default" href={`https://github.com/login/oauth/authorize?client_id=${"Iv23liZcfAnKGoZTUyJs"}&redirect_uri=${"http://localhost/auth/github"}&scope=user`} class="gap-2">
				<GithubIcon class="size-4"/>
				Login with GitHub
			</Button>
		</div>
	</form>
</main>