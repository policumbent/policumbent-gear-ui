<script lang="ts">
	import { onMount } from "svelte";
	import { getBikeInfo, getGearValues, sendBikeData, exportPositions, readPositionsFromFile } from "./api";
	import type { Servo } from "./types";

	let selected_gear: number;
	let selected_servo: Array<number>;
	let num_gears: number;
	let num_servo: number;
	let bike_name: string;
	let positions: Servo[];

	onMount(async () => {
		try {
			await receiveData();
		} catch (error) {
			console.error(error);
		}
	})

	function incrementDown() {
		firstSelectedServo.gears[selected_gear-1].position.down++;
		if (secondSelectedServo)
			secondSelectedServo.gears[selected_gear-1].position.down++;
	}

	function decrementDown() {
		firstSelectedServo.gears[selected_gear-1].position.down++;
		if (secondSelectedServo)
			secondSelectedServo.gears[selected_gear-1].position.down++;
	}

	function incrementUp() {
		firstSelectedServo.gears[selected_gear-1].position.up++;
		if (secondSelectedServo)
			secondSelectedServo.gears[selected_gear-1].position.up++;
	}
	function decrementUp() {
		firstSelectedServo.gears[selected_gear-1].position.up++;
		if (secondSelectedServo)
			secondSelectedServo.gears[selected_gear-1].position.up++;
	}

	function sendData(){
		sendBikeData(positions);
	}

	async function importWrapper(){
		const fileInput = document.getElementById("import-file") as HTMLInputElement;
		try {
			const new_pos = await readPositionsFromFile(fileInput);
			console.log("Read from file: ", new_pos);
			if (new_pos && new_pos.length == positions.length && new_pos.every(p => p.gears.length === num_gears)) {
				positions = new_pos;
				alert("Import successful");
			} else {
				alert("Invalid file");
			}
		} catch (error) {
			console.log(error);
			alert("Invalid file");
		}
	}

	async function receiveData(){
		const bikeInfo = await getBikeInfo();
		console.log("Received bike info: ", bikeInfo);
		num_gears = bikeInfo.gear;
		num_servo = bikeInfo.servo;
		bike_name = bikeInfo.name;
		selected_gear = 1;
		selected_servo = [1];
		const _positions = await getGearValues();
		positions = _positions.sort((a, b) => a.id - b.id);
		console.log("Received positions: ", positions);
	}

	$: firstSelectedServo = positions && positions.find( p => p.id === selected_servo[0] );
	$: secondSelectedServo = positions && selected_servo.length > 1 ? positions.find( p => p.id === selected_servo[1] ) : undefined;
	$: if (num_servo==1) {
		selected_servo = [selected_servo[0]];
	}
</script>

<main class="container">
	{#if !num_servo || !num_gears || !positions }
		<div>
			Getting bike info...
		</div>
	{:else}
		<section>
			<h1>Calibrazione {bike_name}</h1>
			<p>
				Seleziona un servo ed una marcia per iniziare la calibrazione del cambio.<br/>
				Modificare i valori dalla form in fondo alla pagina.<br/>
				Per inviare le modifiche premi sull’icona in basso a destra.<br/>
				Per resettare le modifiche premere l'icona in basso a sinistra, si riprendono i valori attuali dalla bici.
			</p>
		</section>
		<section>
			<div class="gear-container">
				{#if num_servo==1 }
					<div class="single-servo-wrapper">
						<input id="servo_1-1" type="checkbox" value={1} hidden bind:group={selected_servo} />
						<label for="servo_1-1" class="servo" class:selected-servo={selected_servo.includes(1)}>Servo 1</label>
					</div>
				{:else }
					<div class="double-servo-wrapper">
						<input id="servo_2-1" type="checkbox" value={1} hidden bind:group={selected_servo} />
						<label for="servo_2-1" class="servo double-servo" class:selected-servo={selected_servo.includes(1)}>Servo 1</label>
						<input id="servo_2-2" type="checkbox" value={2} hidden bind:group={selected_servo} />
						<label for="servo_2-2" class="servo double-servo" class:selected-servo={selected_servo.includes(2)}>Servo 2</label>
					</div>
				{/if }
				<div class="gears">
					{#each Array(num_gears) as _,i }
						<div class="gear gear-{i+1}" class:selected-gear={selected_gear==i+1} on:click="{ ()=>selected_gear=i+1 }"><span>{i+1}</span></div>
					{/each}
				</div>
			</div>
		</section>	
		{#if selected_gear && selected_servo.length > 0}
			<section>
				<h2>Marcia {selected_gear}</h2>
				{#if num_servo > 1}
					<p>Servo {selected_servo.join(" / ")}</p>
				{/if }
				<div class="form-container">
					<div>
						<label for="down_position_1">DOWN</label>
						<div class="input-wrapper">
							<svg on:click={decrementDown} width="11" height="20" viewBox="0 0 11 20" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M10 19L2.44523 11.76C1.64725 10.9953 1.62085 9.72828 2.38627 8.93097L10 1" stroke="black" stroke-width="2" stroke-linecap="round"/>
							</svg>	
							{#if firstSelectedServo }
								<input bind:value={firstSelectedServo.gears[selected_gear-1].position.down} type="number" id="down_position_1" name="down_position_1" min="0" max="360" step="1" />
							{/if }						
							{#if secondSelectedServo}
								<span>/</span>
								<input bind:value={secondSelectedServo.gears[selected_gear-1].position.down} type="number" id="down_position_2" name="down_position_2" min="0" max="360" step="1" />
							{/if }
							<svg on:click={incrementDown} width="11" height="20" viewBox="0 0 11 20" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M1 1L8.55477 8.23999C9.35275 9.00471 9.37915 10.2717 8.61373 11.069L1 19" stroke="black" stroke-width="2" stroke-linecap="round"/>
							</svg>
						</div>
					</div>
					<div>
						<label for="down_position_1">UP</label>
						<div class="input-wrapper">
							<svg on:click={decrementUp} width="11" height="20" viewBox="0 0 11 20" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M10 19L2.44523 11.76C1.64725 10.9953 1.62085 9.72828 2.38627 8.93097L10 1" stroke="black" stroke-width="2" stroke-linecap="round"/>
							</svg>
							{#if firstSelectedServo }
								<input bind:value={firstSelectedServo.gears[selected_gear-1].position.up} type="number" id="down_position_1" name="down_position_1" min="0" max="360" step="1" />
							{/if }						
							{#if secondSelectedServo}
								<span>/</span>
								<input bind:value={secondSelectedServo.gears[selected_gear-1].position.up} type="number" id="down_position_2" name="down_position_2" min="0" max="360" step="1" />
							{/if }
							<svg on:click={incrementUp} width="11" height="20" viewBox="0 0 11 20" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M1 1L8.55477 8.23999C9.35275 9.00471 9.37915 10.2717 8.61373 11.069L1 19" stroke="black" stroke-width="2" stroke-linecap="round"/>
							</svg>
						</div>
					</div>
				</div>
			</section>
		{/if}
		<section class="export-container">
			<p on:click={() => exportPositions(positions, `${bike_name}_${ Date.now() }.json`)}>Esporta posizioni su file</p>
			<p on:click={() => importWrapper() }>Importa posizioni da file</p>
			<input type="file" id="import-file" hidden>
		</section>
		<div class="send-button" on:click="{ ()=>sendData() }">
			<svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
				<circle cx="27" cy="27" r="27" fill="#C4C4C4"/>
				<path d="M15.7038 16.7988L27.9075 22.0312L15.6875 20.4062L15.7038 16.7988ZM27.8913 30.9688L15.6875 36.2012V32.5938L27.8913 30.9688ZM12.4537 11.875L12.4375 23.25L36.8125 26.5L12.4375 29.75L12.4537 41.125L46.5625 26.5L12.4537 11.875Z" fill="black"/>
			</svg>
		</div>
		<div class="receive-button" on:click="{ ()=>receiveData() }">
			<svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
				<circle cx="27" cy="27" r="27" fill="#C4C4C4"/>
				<path d="M37.25 31.375V36.25H17.75V31.375H14.5V36.25C14.5 38.0375 15.9625 39.5 17.75 39.5H37.25C39.0375 39.5 40.5 38.0375 40.5 36.25V31.375H37.25ZM35.625 24.875L33.3338 22.5838L29.125 26.7763V13.5H25.875V26.7763L21.6662 22.5838L19.375 24.875L27.5 33L35.625 24.875Z" fill="black"/>
			</svg>
		</div>
	{/if}
</main>

<style lang="scss">
	.container{
		max-width: 500px;
		margin: auto;
	}

	.gear-container{
		position: relative;
	}

	.gears{
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		padding: 39px 0px;
	}

	.gear {
		width: 20px;
		border: 1px solid black;
		background-color: #aaaaaa;
		text-align: center;
		display: flex;
		justify-content: center;
		flex-direction: column;
		cursor: pointer;
		z-index: 2;
		-webkit-touch-callout: none; /* iOS Safari */
		-webkit-user-select: none; /* Safari */
		-khtml-user-select: none; /* Konqueror HTML */
		-moz-user-select: none; /* Old versions of Firefox */
			-ms-user-select: none; /* Internet Explorer/Edge */
				user-select: none; 
		&.selected-gear{
			background-color: #000;
			color: #fff;
		}
	}

	@for $i from 1 through 20 {
		.gear-#{$i} {
			height: #{300 - 20*$i}px;
		}
	}

	.servo{
		background-color: #aaaaaa;
		color: #000;
		padding: 8px;
		z-index: 1;
		-webkit-touch-callout: none; /* iOS Safari */
		-webkit-user-select: none; /* Safari */
		-khtml-user-select: none; /* Konqueror HTML */
		-moz-user-select: none; /* Old versions of Firefox */
		-ms-user-select: none; /* Internet Explorer/Edge */
		user-select: none; 
		&.selected-servo{
			background-color: #000;
			color: #fff;
		}
	}

	.single-servo-wrapper{
		position: absolute;
		top: calc(50% - 12px);
		left: 0;
		right: 0;
	}

	.double-servo-wrapper{
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 1;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	input[type="number"]{
		border-radius: 4px;
		text-align: center;
		-moz-appearance: textfield;
		margin: 0;
		width: 50px;
	}
	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
	-webkit-appearance: none;
		margin: 0;
	}

	.form-container{
		display: flex;
		flex-direction: column;
		label {
			display: block;
			text-align: center;
			margin-bottom: 12px;
		}
		svg {
			cursor: pointer;
			margin: 0px 20px;
			flex-shrink: 0;
		}
		span {
			margin: 0px 8px;
		}
		> div {
			width: 100%;
		}
	}

	.input-wrapper{
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		width: 100%;
		margin-bottom: 12px;
	}

	.send-button {
		position: fixed;
		bottom: 8px;
		right: 8px;
		cursor: pointer;
		z-index: 3;
	}

	.receive-button {
		position: fixed;
		bottom: 8px;
		left: 8px;
		cursor: pointer;
		z-index: 3;
	}

	.export-container p{
		text-decoration: underline;
		cursor: pointer;
	}

	@media (min-width: 640px) {
		.gear {
			width: 25px;
			// scale animation on hover
			&:hover{
				transform: scale(1.1);
				transition: transform 0.1s ease-in-out;
			}
		}

		.form-container{
			flex-direction: row;
			> div {
				width: 50%;
			}
		}
	}
</style>