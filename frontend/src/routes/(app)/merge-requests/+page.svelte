<script lang="ts">
	const sampleDiff = `@@ -1,7 +1,7 @@
import React from 'react';
-import { Button } from './Button';
+import { Button } from '@/components/ui/button';

-function App() {
+export default function App() {
return (
	<div className="App">
	<h1>Hello, World!</h1>
@@ -9,6 +9,6 @@ function App() {
	<Button>Click me</Button>
	</div>
);
-}
+};
	
-export default App;`;

	interface DiffLine {
		type: 'normal' | 'addition' | 'deletion';
		content: string;
	}

	export function parseDiff(diffContent: string): DiffLine[] {
		return diffContent.split('\n').filter((line) => {
			return !line.startsWith('---') && !line.startsWith('+++') && !line.startsWith('@@');
		}).map((line) => {
			if (line.startsWith('+')) {
				return { type: 'addition', content: line.slice(1) };
			} else if (line.startsWith('-')) {
				return { type: 'deletion', content: line.slice(1) };
			} else {
				return { type: 'normal', content: line };
			}
		});
	}
</script>

<div class="flex flex-col gap-4 font-mono">
	{#each parseDiff(sampleDiff) as { type, content }, i}
		<div class="flex gap-2 h-2">
			<div class="w-12 text-right text-gray-500 font-mono gallery">
				<div class="gallery">
					<div class="size-4 rounded bg-yellow-500 frame opacity-0 hover:opacity-100 transition-all text-white">
						+
					</div>
				</div>
				<div class="w-4">
					{i + 1}
				</div>
			</div>
			<div class="flex-1">
				<code class="font-mono hover:bg-gray-800 flex-1" class:line-through={type === 'deletion'} class:text-green-500={type === 'addition'} class:text-gray-500={type === 'normal'} class:text-red-500={type === 'deletion'}>
					{content}
				</code>
			</div>
		</div>
	{/each}
</div>