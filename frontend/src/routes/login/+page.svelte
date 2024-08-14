<script lang="ts">
    import { onMount } from 'svelte';
	import type { PageData } from './$types';
    import { error } from '@sveltejs/kit';
    import { goto } from '$app/navigation';
    import Button from '@/components/ui/button/button.svelte';
    import { Github, GithubIcon } from 'lucide-svelte';

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

<main class="h-screen w-screen flex items-center justify-center">
	<form action="/login" method="post" target="_blank" class="flex flex-col rounded-3xl border min-h-96 min-w-96 py-12 px-48">
		<span class="font-medium text-2xl text-slate-200">
			Login
		</span>

		<label for="full_name">Full Name</label>
		<input name="full_name"/>
	
		<label for="email">Email</label>
		<input type="email" name="email"/>
	
		<button type="submit">
			Create
		</button>
	</form>

	<Button variant="default" href={`https://github.com/login/oauth/authorize?client_id=${"Iv23liZcfAnKGoZTUyJs"}&redirect_uri=${"http://localhost/auth/github"}&scope=user`}>
		<GithubIcon class="size-6"/>
		Login with GitHub
	</Button>
</main>