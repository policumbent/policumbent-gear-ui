<script lang="ts">
	import { onMount } from "svelte";
	import { getBikeInfo, getGearValues, sendBikeData } from "./api";
	import type { Servo } from "./types";

	let selected_gear: number;
	let selected_servo: Array<number>;
	let num_gears: number;
	let num_servo: number;
	let bike_name: string;
	let positions: Servo[];

	onMount(async () => {
		try {
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
		} catch (error) {
			console.error(error);
		}
	})

	function incrementDown() {
		firstSelectedServo.gears[selected_gear-1].position.shift_down++;
		if (secondSelectedServo)
			secondSelectedServo.gears[selected_gear-1].position.shift_down++;
	}

	function decrementDown() {
		firstSelectedServo.gears[selected_gear-1].position.shift_down++;
		if (secondSelectedServo)
			secondSelectedServo.gears[selected_gear-1].position.shift_down++;
	}

	function incrementUp() {
		firstSelectedServo.gears[selected_gear-1].position.shift_up++;
		if (secondSelectedServo)
			secondSelectedServo.gears[selected_gear-1].position.shift_up++;
	}
	function decrementUp() {
		firstSelectedServo.gears[selected_gear-1].position.shift_up++;
		if (secondSelectedServo)
			secondSelectedServo.gears[selected_gear-1].position.shift_up++;
	}

	function sendData(){
		sendBikeData(positions);
	}

	$: firstSelectedServo = positions && positions.find( p => p.id === selected_servo[0] );
	$: secondSelectedServo = positions && selected_servo.length > 1 ? positions.find( p => p.id === selected_servo[1] ) : undefined;
	
</script>

<main class="container">
	{#if !num_servo || !num_gears || !positions }
	<div>
		Getting bike info...
	</div>
	{:else}
	<section>
		<p>
			Seleziona un servo ed una marcia per iniziare la calibrazione del cambio.<br/>
			Modificare i valori dalla form in fondo alla pagina.<br/>
			Per inviare le modifiche premi sull’icona in basso a destra.
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
							<input bind:value={firstSelectedServo.gears[selected_gear-1].position.shift_down} type="number" id="down_position_1" name="down_position_1" min="0" max="360" step="1" />
						{/if }						
						{#if secondSelectedServo}
							<span>/</span>
							<input bind:value={secondSelectedServo.gears[selected_gear-1].position.shift_down} type="number" id="down_position_2" name="down_position_2" min="0" max="360" step="1" />
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
							<input bind:value={firstSelectedServo.gears[selected_gear-1].position.shift_up} type="number" id="down_position_1" name="down_position_1" min="0" max="360" step="1" />
						{/if }						
						{#if secondSelectedServo}
							<span>/</span>
							<input bind:value={secondSelectedServo.gears[selected_gear-1].position.shift_up} type="number" id="down_position_2" name="down_position_2" min="0" max="360" step="1" />
						{/if }
						<svg on:click={incrementUp} width="11" height="20" viewBox="0 0 11 20" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M1 1L8.55477 8.23999C9.35275 9.00471 9.37915 10.2717 8.61373 11.069L1 19" stroke="black" stroke-width="2" stroke-linecap="round"/>
						</svg>
					</div>
				</div>
			</div>
		</section>
	{/if}
		<div class="send-button" on:click="{ ()=>sendData() }">
			<svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
				<circle cx="27" cy="27" r="27" fill="#C4C4C4"/>
				<path d="M37.8981 19.4279L31.6202 40.5205C31.0902 42.3015 28.6298 42.46 27.8755 40.7618L23.7179 31.401C23.4162 30.7217 22.8732 30.1786 22.1939 29.877L12.8331 25.7194C11.1349 24.9651 11.2935 22.5047 13.0744 21.9747L34.167 15.6968C36.4512 15.0169 38.578 17.1437 37.8981 19.4279Z" stroke="black" stroke-width="2"/>
				<path d="M29.6216 23.9734L23.1398 30.4552" stroke="black" stroke-width="2" stroke-linecap="round"/>
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

	.send-button{
		position: fixed;
		bottom: 8px;
		right: 8px;
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