<script lang="ts">
    import { onMount } from 'svelte';
    import { error } from '@sveltejs/kit';
    import { goto } from '$app/navigation';
	import { page } from '$app/stores';
    import Button from '@/components/ui/button/button.svelte';
    import { Github, GithubIcon, Key, KeyRoundIcon } from 'lucide-svelte';
    import { client } from '@/state';
    import { toast } from 'svelte-sonner';
	import { bufferToBase64URLString, base64URLStringToBuffer } from '@simplewebauthn/browser';

	let email = $state("fvilla@netnix.net");

	async function handleLogin() {
		await goto(`/auth?email=${email}`);
	}

	async function createPasskey() {
		console.log("Requesting passkey challenge for email:", email);

		const { data } = await client.api.auth.passkeys.challenges.get({ query: { email } });

		if (!data) {
			throw error(500, "No passkeys found for this email.");
		}

		console.log("Passkeys challenge:", data);
		console.log("typeof", typeof data.options.user.id);

		const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
			challenge: base64URLStringToBuffer(btoa(data.options.challenge)),
			rp: data.options.rp,
			user: {
				...data.options.user,
				id: Uint8Array.from(data.options.user.id),
			},
			pubKeyCredParams: data.options.pubKeyCredParams,
			excludeCredentials: data.options.excludeCredentials,
			authenticatorSelection: {
				authenticatorAttachment: "platform",
				requireResidentKey: true,
			},
		};

		console.log("btoa", btoa(data.options.challenge));
		console.log("undone", bufferToBase64URLString(publicKeyCredentialCreationOptions.challenge));

		console.log("Creating passkey:", publicKeyCredentialCreationOptions);

		let credential: Credential | null = null;

		try {
			credential = await navigator.credentials.create({
				publicKey: publicKeyCredentialCreationOptions,
			});

			console.log("Passkey created:", credential);
		} catch (e) {
			console.error(e);
			toast.error("Failed to create passkey.",);
			return;
		}

		if (!credential) {
			toast.warning("Passkey creation was cancelled.");
			return;
		}

		if (credential.type !== "public-key") {
			toast.error("Invalid credential type.");
			return;
		}

		const res = await client.api.auth.passkeys.post({
			challenge: bufferToBase64URLString(base64URLStringToBuffer(btoa(data.options.challenge))),
			credential: {
				id: credential.id,
				rawId: credential.id,
				type: credential.type,
				response: {
					attestationObject: bufferToBase64URLString(credential.response.attestationObject),
					clientDataJSON: bufferToBase64URLString(credential.response.clientDataJSON),
					publicKey: (new TextDecoder()).decode(credential.response.getPublicKey()),
				},
				clientExtensionResults: credential.getClientExtensionResults(),
			},
		});

		console.log("Passkey assertion response:", res);
	}

	async function handlePasskeyLogin() {
		if(!PublicKeyCredential || !(await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()) || !(await PublicKeyCredential.isConditionalMediationAvailable())) {
			toast.error("Cannot perform a passkey based login since this browser does not seem to support them!");
			// return;
		}

		let passkeys_req = await client.api.auth.passkeys.get({ query: { email } });

		if (!passkeys_req.data || passkeys_req.data.passkeys.length === 0) {
			console.log("No passkeys found for this email, creating one...");
			await createPasskey();
		}

		passkeys_req = await client.api.auth.passkeys.get({ query: { email } });

		console.log("Passkeys found:", passkeys_req.data);

		const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
			challenge: Uint8Array.from(passkeys_req.data.challenge),
			allowCredentials: passkeys_req.data.passkeys.map(passkey => ({
				id: base64URLStringToBuffer(btoa(passkey.id)),
				type: "public-key",
				transports: ["internal"],
			})),
			userVerification: "discouraged",
		};

		const assertion = await navigator.credentials.get({
			publicKey: publicKeyCredentialRequestOptions,
		});

		if (!assertion) {
			toast.warning("Passkey login was cancelled.");
			return;
		}

		console.log("Passkey assertion:", assertion);

		const { data } = await client.api.auth.token.post({
			passkey: {
				challenge: bufferToBase64URLString(assertion.response.authenticatorData),
				response: {
					id: assertion.id,
					rawId: assertion.id,
					type: assertion.type,
					response: {
						authenticatorData: bufferToBase64URLString(assertion.response.authenticatorData),
						clientDataJSON: bufferToBase64URLString(assertion.response.clientDataJSON),
						attestationObject: bufferToBase64URLString(assertion.response.userHandle),
					},
					clientExtensionResults: assertion.getClientExtensionResults(),
				}
			}
		});

		if (!data) {
			toast.error("Could not perform login!");
		}

		await goto(`/auth`);
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
