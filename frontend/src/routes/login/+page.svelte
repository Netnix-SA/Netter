<script lang="ts">
    import { onMount } from 'svelte';
    import { error } from '@sveltejs/kit';
    import { goto } from '$app/navigation';
	import { page } from '$app/stores';
    import Button from '@/components/ui/button/button.svelte';
    import { Github, GithubIcon, Key, KeyRoundIcon } from 'lucide-svelte';
    import { client } from '@/state';

	let email = $state("fvilla@netnix.net");

	async function handleLogin() {
		await goto(`/auth?email=${email}`);
	}

	async function handlePasskeyLogin() {
		if(!PublicKeyCredential || !(await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()) || !(await PublicKeyCredential.isConditionalMediationAvailable())) {
			throw error(500, "Browser does not support passkeys, which are required by Netter.");
		}

		const { data } = await client.api.auth.passkeys.get({ email });

		if (!data) {
			throw error(500, "No passkeys found for this email.");
		}

		const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
			challenge: new ArrayBuffer(data.options.challenge),
			rp: {
				name: "Netter",
				id: $page.url.origin,
			},
			user: data?.options.user,
			pubKeyCredParams: [{ alg: -7, type: "public-key" },{ alg: -257, type: "public-key" }],
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

		const credential = await navigator.credentials.create({
			publicKey: publicKeyCredentialCreationOptions
		});

		const publicKeyCredentialRequestOptions = {
			challenge: new Uint8Array([/* challenge from server */]),
			rpId: $page.url.origin,
			userVerification: "required",
		};

		await client.api.auth.passkeys.post({ credential });

		const assertion = await navigator.credentials.get({
			publicKey: publicKeyCredentialRequestOptions
		});

		await goto(`/auth?email=${email}`);
	}

	async function handleGitHubLogin() {
		await goto(`https://github.com/login/oauth/authorize?client_id=${"Iv23liZcfAnKGoZTUyJs"}&redirect_uri=${`${$page.url.origin}/auth/github`}&scope=user`);
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
			<input name="email" type="email" class="border px-2 py-1" bind:value={email}/>
		</div>
		<div class="frame flex-col w-full gap-2">
			<Button variant="default" onclick={handleLogin} class="gap-2">
				<Key class="size-4"/>
				Login
			</Button>
			<Button variant="default" onclick={handlePasskeyLogin} class="gap-2">
				<KeyRoundIcon class="size-4"/>
				Login with Passkey
			</Button>
			<Button variant="default" href={`https://github.com/login/oauth/authorize?client_id=${"Iv23liZcfAnKGoZTUyJs"}&redirect_uri=${`${$page.url.origin}/auth/github`}&scope=user`} class="gap-2">
				<GithubIcon class="size-4"/>
				Login with GitHub
			</Button>
		</div>
	</form>
</main>
