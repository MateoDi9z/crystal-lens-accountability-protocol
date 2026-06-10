<script lang="ts">
	import Header from "$lib/components/landing/header.svelte";
	import Hero from "$lib/components/landing/hero.svelte";
	import StatsBar from "$lib/components/landing/stats-bar.svelte";
	import About from "$lib/components/landing/about.svelte";
	import HowItWorks from "$lib/components/landing/how-it-works.svelte";
	import Pillars from "$lib/components/landing/pillars.svelte";
	import Features from "$lib/components/landing/features.svelte";
	import Cta from "$lib/components/landing/cta.svelte";
	import Footer from "$lib/components/landing/footer.svelte";
</script>

<svelte:head>
	<title>Crystal Lens — Transparent Governance Protocol</title>
	<meta name="description" content="Crystal Lens Accountability Protocol — infrastructure for transparent, democratic, and accountable organizations." />
</svelte:head>

<Header />
<Hero />
<StatsBar />
<section id="about"><About /></section>
<section id="how-it-works"><HowItWorks /></section>
<section id="architecture"><Pillars /></section>
<section id="features"><Features /></section>
<Cta />
<Footer />
