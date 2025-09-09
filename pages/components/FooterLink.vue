<template>
	<a
		:href="href"
		target="_blank"
		rel="noopener noreferrer"
		class="hover:underline mx-2"
	>
		<slot></slot>
	</a>
</template>

<script setup lang="ts">
defineProps<{
	href: string
}>()
</script>
