<script lang="ts">
	import { onMount } from "svelte";
	import { getBikeInfo, getGearValues, getPid, sendBikeData, setPid} from "./lib/api";
	import { exportPositions, readPositionsFromFile } from "./lib/utils";
	import { toast, SvelteToast } from "@zerodevx/svelte-toast";
	import type { Pid, Servo } from "./lib/types";

	let selected_gear: number;
	let selected_servo: Array<number>;
	let num_gears: number;
	let num_servo: number;
	let bike_name: string;
	let pid: Pid;
	let new_positions: Servo[];
	let reverse = false;

	onMount(async () => {
		try {
			await receiveData();
			toast.push("Bike connected.", {
				duration: 1500,
				theme: {
					"--toastBackground": "green"
				}
			});
		} catch (error) {
			console.error(error);
			toast.push("Unable to receive data from the bike, check that you are connected to the same network and the API Endpoint is correct. Open the console for more details.", {
				theme: {
					"--toastBackground": "red"
				}
			});
		}
	})

	function incrementDown() {
		firstSelectedServo.gears[selected_gear-1].position.down++;
		if (secondSelectedServo)
			secondSelectedServo.gears[selected_gear-1].position.down++;
	}

	function decrementDown() {
		firstSelectedServo.gears[selected_gear-1].position.down--;
		if (secondSelectedServo) {
			secondSelectedServo.gears[selected_gear-1].position.down--;
		}
	}

	function incrementUp() {
		firstSelectedServo.gears[selected_gear-1].position.up++;
		if (secondSelectedServo)
			secondSelectedServo.gears[selected_gear-1].position.up++;
	}
	
	function decrementUp() {
		firstSelectedServo.gears[selected_gear-1].position.up--;
		if (secondSelectedServo) {
			secondSelectedServo.gears[selected_gear-1].position.up--;
		}
	}

	async function sendGear(){
		try {
			let data = [
				new_positions[0].gears[selected_gear-1]
			];
			if (num_servo > 1)
				data.push(new_positions[1].gears[selected_gear-1]);
			if (await sendBikeData(data)==0){
				toast.push(`Gear ${selected_gear} sent successfully`, {
					theme: {
						"--toastBackground": "green"
					}
				});
			}
		} catch (error) {
			toast.push(`Error sending ${selected_gear}° gear:\n${error}`, {
				theme: {
					"--toastBackground": "red"
				}
			});
		}
	}

	async function sendAllGears(){
		try {
			let promises = [];
			new_positions[0].gears.forEach((gear, i) => {
				let data = [
					gear
				];
				if (num_servo > 1)
					data.push(new_positions[1].gears[i-1]);
				promises.push(sendBikeData(data));
			});
			await Promise.all(promises);
			toast.push("All gears sent successfully", {
				theme: {
					"--toastBackground": "green"
				}
			});
		} catch (error) {
			toast.push("Error sending gears: " + error, {
				theme: {
					"--toastBackground": "red"
				}
			});
		}
	}

	async function importWrapper(){
		const fileInput = document.getElementById("import-file") as HTMLInputElement;
		try {
			const new_pos = await readPositionsFromFile(fileInput);
			console.log("Read from file: ", new_pos);
			if (new_pos && num_servo === new_pos.length && new_pos.every(p => p.gears.length === num_gears)) {
				// old_positions = JSON.parse(JSON.stringify(new_pos));
				new_positions = JSON.parse(JSON.stringify(new_pos));
				toast.push("Import from file done", {
					theme: {
						"--toastBackground": "green"
					}
				});
			} else {
				if (num_servo !== new_pos.length)
					toast.push("Number of servos in file does not match number of servos in bike, try another file.", {
						theme: {
							"--toastBackground": "red"
						}
					});
				else if (!new_pos.every(p => p.gears.length === num_gears))
					toast.push("Number of gears in file does not match number of gears in bike, try another file.", {
						theme: {
							"--toastBackground": "red"
						}
					});
				else
					toast.push("Invalid file.", {
						theme: {
							"--toastBackground": "red"
						}
					});
			}
		} catch (error) {
			console.log("Error: ", error);
			toast.push("Invalid file.", {
				theme: {
					"--toastBackground": "red"
				}
			});
		}
	}

	async function sendPid(){
		console.log(pid);
		try {
			if (await setPid(pid)=="ok"){
				toast.push("PID sent succesfully.", {
					theme: {
						"--toastBackground": "green"
					}
				});
			}
		} catch (error) {
			toast.push(`Error sending PID:\n${error}`, {
				theme: {
					"--toastBackground": "red"
				}
			});
		}
	}

	async function resetPid(){
		try {
			pid = await getPid();
			toast.push("PID reset done.", {
				theme: {
					"--toastBackground": "green"
				}
			});
		} catch (error) {
			toast.push(`Error getting PID:\n${error}`, {
				theme: {
					"--toastBackground": "red"
				}
			});
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
		new_positions = _positions.sort((a, b) => a.id - b.id);
		//old_positions = JSON.parse(JSON.stringify(new_positions));
		console.log("Received positions: ", new_positions);
		if (num_servo == 1)
			pid = await getPid();
	}

	$: firstSelectedServo = new_positions && new_positions.find( p => p.id === selected_servo[0] );
	$: secondSelectedServo = new_positions && selected_servo.length > 1 ? new_positions.find( p => p.id === selected_servo[1] ) : undefined;
	$: if (num_servo==1) {
		selected_servo = [selected_servo[0]];
	}
</script>

<main class="container">
	{#if !num_servo || !num_gears || !new_positions }
		<div>
			Getting bike info...
		</div>
	{:else}
		<section>
			<h1>Calibrazione {bike_name}</h1>
			<p>
				Seleziona un servo ed una marcia per iniziare la calibrazione del cambio.<br/>
				Modificare i valori dalla form in fondo alla pagina.<br/>
				Per inviare le modifiche alla bici premi su uno dei due bottoni in basso a destra, uno invia solo la marcia selezionata e l'altro tutte le marce.<br/>
				Per resettare le modifiche premere l'icona in basso a sinistra, si riprendono i valori attuali dalla bici.
			</p>
			<input type=checkbox bind:checked={reverse} id="reverseCheckbox" hidden >
			<label class="reverse-button" for="reverseCheckbox">Inverti layout</label>
			
		</section>
		{#if num_servo==1 && pid}
		<section>
			<h2>Modifica PID</h2>
			<div class="pid-form">
				<form>
					<div class="form-group">
						<label for="kp">Kp: </label>
						<input type="number" class="form-control" id="kp" bind:value={pid.Kp} step="0.01">
					</div>
					<div class="form-group">
						<label for="ki">Ki: </label>
						<input type="number" class="form-control" id="ki" bind:value={pid.Ki} step="0.01">
					</div>
					<div class="form-group">
						<label for="kd">Kd: </label>
						<input type="number" class="form-control" id="kd" bind:value={pid.Kd} step="0.01">
					</div>
					<div class="form-btn-wrapper">
						<button type="button" on:click={resetPid}>Reset PID</button>
						<button type="button" on:click={sendPid}>Invia PID</button>
					</div>
				</form>
			</div>
		</section>
		{/if}
		<section>
			<div class="gear-container">
				{#if num_servo==1 }
					<div class="single-servo-wrapper">
						<input id="servo_1-1" type="checkbox" value={1} hidden bind:group={selected_servo} />
						<label for="servo_1-1" class="servo" class:selected-servo={selected_servo.includes(1)} on:click={e => e.preventDefault()}>Servo 1</label>
					</div>
				{:else }
					<div class="double-servo-wrapper">
						<input id="servo_2-1" type="checkbox" value={1} hidden bind:group={selected_servo} />
						<label for="servo_2-1" class="servo double-servo" class:selected-servo={selected_servo.includes(1)}>Servo 1</label>
						<input id="servo_2-2" type="checkbox" value={2} hidden bind:group={selected_servo} />
						<label for="servo_2-2" class="servo double-servo" class:selected-servo={selected_servo.includes(2)}>Servo 2</label>
					</div>
				{/if }
				<div class="gears" class:gears-reverse="{reverse}">
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
							<svg on:click={() => reverse ? incrementDown() : decrementDown()} width="11" height="20" viewBox="0 0 11 20" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M10 19L2.44523 11.76C1.64725 10.9953 1.62085 9.72828 2.38627 8.93097L10 1" stroke="black" stroke-width="2" stroke-linecap="round"/>
							</svg>	
							{#if firstSelectedServo }
								<input bind:value={firstSelectedServo.gears[selected_gear-1].position.down} type="number" id="down_position_1" name="down_position_1" step="1" />
							{/if }						
							{#if secondSelectedServo}
								<span>/</span>
								<input bind:value={secondSelectedServo.gears[selected_gear-1].position.down} type="number" id="down_position_2" name="down_position_2" step="1" />
							{/if }
							<svg on:click={() => reverse ? decrementDown() : incrementDown()} width="11" height="20" viewBox="0 0 11 20" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M1 1L8.55477 8.23999C9.35275 9.00471 9.37915 10.2717 8.61373 11.069L1 19" stroke="black" stroke-width="2" stroke-linecap="round"/>
							</svg>
						</div>
					</div>
					<div>
						<label for="down_position_1">UP</label>
						<div class="input-wrapper">
							<svg on:click={() => reverse ? incrementUp() : decrementUp()} width="11" height="20" viewBox="0 0 11 20" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M10 19L2.44523 11.76C1.64725 10.9953 1.62085 9.72828 2.38627 8.93097L10 1" stroke="black" stroke-width="2" stroke-linecap="round"/>
							</svg>
							{#if firstSelectedServo }
								<input bind:value={firstSelectedServo.gears[selected_gear-1].position.up} type="number" id="down_position_1" name="down_position_1" step="1" />
							{/if }						
							{#if secondSelectedServo}
								<span>/</span>
								<input bind:value={secondSelectedServo.gears[selected_gear-1].position.up} type="number" id="down_position_2" name="down_position_2" step="1" />
							{/if }
							<svg on:click={() => reverse ? decrementUp() : incrementUp()} width="11" height="20" viewBox="0 0 11 20" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M1 1L8.55477 8.23999C9.35275 9.00471 9.37915 10.2717 8.61373 11.069L1 19" stroke="black" stroke-width="2" stroke-linecap="round"/>
							</svg>
						</div>
					</div>
				</div>
			</section>
		{/if}
		<section class="export-container">
			<span on:click={() => exportPositions(new_positions, `${bike_name}_${ Date.now() }.json`)}>Esporta posizioni su file</span>
			<br/>
			<span on:click={() => importWrapper() }>Importa posizioni da file</span>
			<input type="file" id="import-file" hidden>
		</section>
		<section class="version">
			v{`__VERSION__`}
		</section>

		<div class="send-button send-button-all" on:click="{ ()=>sendAllGears() }">
			<svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
				<circle cx="27" cy="27" r="27" fill="#C4C4C4"/>
				<path d="M39.9303 14.3291C40.0007 14.1531 40.018 13.9602 39.9799 13.7744C39.9418 13.5887 39.85 13.4182 39.7159 13.2841C39.5818 13.15 39.4113 13.0582 39.2255 13.0201C39.0398 12.982 38.8469 12.9993 38.6709 13.0697L10.4861 24.3441C10.2379 24.4434 10.0219 24.6093 9.86186 24.8235C9.70187 25.0377 9.60407 25.2919 9.57923 25.5581C9.55439 25.8243 9.60348 26.0922 9.72109 26.3323C9.83869 26.5724 10.0203 26.7754 10.2458 26.919L19.9236 33.0764L22.8899 37.738C23.03 37.9495 23.2475 38.0976 23.4957 38.1505C23.7438 38.2034 24.0028 38.1568 24.2169 38.0208C24.4311 37.8848 24.5834 37.6702 24.641 37.4231C24.6987 37.1761 24.6571 36.9162 24.5252 36.6995L21.8592 32.5106L36.3788 17.991L32.7073 27.1709C32.6568 27.2895 32.6306 27.417 32.63 27.5459C32.6295 27.6748 32.6547 27.8026 32.7041 27.9216C32.7536 28.0406 32.8263 28.1486 32.918 28.2392C33.0098 28.3298 33.1186 28.4012 33.2383 28.4491C33.358 28.4971 33.486 28.5207 33.6149 28.5185C33.7438 28.5164 33.8709 28.4885 33.9889 28.4366C34.1069 28.3847 34.2134 28.3098 34.302 28.2162C34.3907 28.1226 34.4598 28.0122 34.5053 27.8916L39.9303 14.3291V14.3291ZM35.009 16.6212L20.4894 31.1408L12.0826 25.7914L35.009 16.6212V16.6212Z" fill="black"/>
				<path d="M40 37.2188C40 39.0172 39.2855 40.7421 38.0138 42.0138C36.7421 43.2855 35.0172 44 33.2188 44C31.4203 44 29.6954 43.2855 28.4237 42.0138C27.152 40.7421 26.4375 39.0172 26.4375 37.2188C26.4375 35.4203 27.152 33.6954 28.4237 32.4237C29.6954 31.152 31.4203 30.4375 33.2188 30.4375C35.0172 30.4375 36.7421 31.152 38.0138 32.4237C39.2855 33.6954 40 35.4203 40 37.2188V37.2188ZM33.2188 33.3438C32.9618 33.3438 32.7154 33.4458 32.5337 33.6275C32.3521 33.8092 32.25 34.0556 32.25 34.3125V36.25H30.3125C30.0556 36.25 29.8092 36.3521 29.6275 36.5337C29.4458 36.7154 29.3438 36.9618 29.3438 37.2188C29.3438 37.4757 29.4458 37.7221 29.6275 37.9038C29.8092 38.0854 30.0556 38.1875 30.3125 38.1875H32.25V40.125C32.25 40.3819 32.3521 40.6283 32.5337 40.81C32.7154 40.9917 32.9618 41.0938 33.2188 41.0938C33.4757 41.0938 33.7221 40.9917 33.9038 40.81C34.0854 40.6283 34.1875 40.3819 34.1875 40.125V38.1875H36.125C36.3819 38.1875 36.6283 38.0854 36.81 37.9038C36.9917 37.7221 37.0938 37.4757 37.0938 37.2188C37.0938 36.9618 36.9917 36.7154 36.81 36.5337C36.6283 36.3521 36.3819 36.25 36.125 36.25H34.1875V34.3125C34.1875 34.0556 34.0854 33.8092 33.9038 33.6275C33.7221 33.4458 33.4757 33.3438 33.2188 33.3438Z" fill="black"/>
			</svg>
		</div>
		<div class="send-button send-button-one" on:click="{ ()=>sendGear() }">
			<svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
				<circle cx="27" cy="27" r="27" fill="#C4C4C4"/>
				<g clip-path="url(#clip0_13_53)">
				<path d="M39.7171 13.2829C39.8512 13.4172 39.9429 13.588 39.9808 13.774C40.0187 13.96 40.0011 14.153 39.9302 14.3291L28.6559 42.5139C28.5566 42.7621 28.3907 42.9781 28.1765 43.1381C27.9623 43.2981 27.7081 43.3959 27.4419 43.4208C27.1757 43.4456 26.9078 43.3965 26.6677 43.2789C26.4276 43.1613 26.2246 42.9797 26.081 42.7542L19.9236 33.0764L10.2458 26.919C10.0197 26.7756 9.83768 26.5725 9.71972 26.3322C9.60176 26.0918 9.55249 25.8236 9.57735 25.557C9.6022 25.2905 9.70021 25.0359 9.86056 24.8216C10.0209 24.6072 10.2374 24.4413 10.4861 24.3421L38.6709 13.0717C38.847 13.0008 39.04 12.9832 39.226 13.0211C39.412 13.059 39.5828 13.1507 39.7171 13.2848V13.2829ZM21.8572 32.5106L27.2067 40.9155L36.3769 17.991L21.8572 32.5106ZM35.0071 16.6212L12.0826 25.7914L20.4894 31.1389L35.009 16.6212H35.0071Z" fill="black"/>
				</g>
				<defs>
				<clipPath id="clip0_13_53">
				<rect width="31" height="31" fill="white" transform="translate(9 13)"/>
				</clipPath>
				</defs>
			</svg>
				
		</div>
		<div class="receive-button" on:click="{ ()=>receiveData() }">
			<svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
				<circle cx="27" cy="27" r="27" fill="#C4C4C4"/>
				<path d="M13.9062 30.9438C14.1466 30.9438 14.3771 31.0392 14.5471 31.2092C14.717 31.3791 14.8125 31.6097 14.8125 31.85V36.3813C14.8125 36.862 15.0035 37.323 15.3434 37.6629C15.6833 38.0028 16.1443 38.1938 16.625 38.1938H38.375C38.8557 38.1938 39.3167 38.0028 39.6566 37.6629C39.9965 37.323 40.1875 36.862 40.1875 36.3813V31.85C40.1875 31.6097 40.283 31.3791 40.4529 31.2092C40.6229 31.0392 40.8534 30.9438 41.0938 30.9438C41.3341 30.9438 41.5646 31.0392 41.7346 31.2092C41.9045 31.3791 42 31.6097 42 31.85V36.3813C42 37.3427 41.6181 38.2647 40.9383 38.9445C40.2584 39.6243 39.3364 40.0063 38.375 40.0063H16.625C15.6636 40.0063 14.7416 39.6243 14.0617 38.9445C13.3819 38.2647 13 37.3427 13 36.3813V31.85C13 31.6097 13.0955 31.3791 13.2654 31.2092C13.4354 31.0392 13.6659 30.9438 13.9062 30.9438V30.9438Z" fill="black"/>
				<path d="M26.8584 34.4854C26.9425 34.5698 27.0425 34.6367 27.1526 34.6824C27.2627 34.7281 27.3808 34.7516 27.5 34.7516C27.6192 34.7516 27.7372 34.7281 27.8473 34.6824C27.9574 34.6367 28.0574 34.5698 28.1416 34.4854L33.5791 29.0479C33.7493 28.8777 33.8449 28.6469 33.8449 28.4063C33.8449 28.1656 33.7493 27.9348 33.5791 27.7646C33.4089 27.5945 33.1781 27.4989 32.9375 27.4989C32.6968 27.4989 32.466 27.5945 32.2959 27.7646L28.4062 31.6561V15.7188C28.4062 15.4784 28.3108 15.2479 28.1408 15.0779C27.9708 14.908 27.7403 14.8125 27.5 14.8125C27.2596 14.8125 27.0291 14.908 26.8592 15.0779C26.6892 15.2479 26.5937 15.4784 26.5937 15.7188V31.6561L22.7041 27.7646C22.5339 27.5945 22.3031 27.4989 22.0625 27.4989C21.8218 27.4989 21.591 27.5945 21.4209 27.7646C21.2507 27.9348 21.1551 28.1656 21.1551 28.4063C21.1551 28.6469 21.2507 28.8777 21.4209 29.0479L26.8584 34.4854V34.4854Z" fill="black"/>
			</svg>
		</div>
	{/if}
	<SvelteToast />
</main>

<style lang="scss">
	.container{
		max-width: 500px;
		margin: auto;
	}

	.gear-container{
		position: relative;
	}
	
	.reverse-button{
		background-color: #aaaaaa;
		padding: 12px;
		cursor: pointer;
		display: inline-block;
		border-radius: 8px;
	}

	.version{
		margin-top: 5%;
		color: #aaaaaa;
		display: flex;
		justify-content: center;
		font-size: 0.8em;
	}

	.gears{
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		padding: 39px 0px;
		&-reverse{
			flex-direction: row-reverse;
		}
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
		cursor: pointer;
		z-index: 3;
	}

	.send-button-one {
		right: 8px;
	}

	.send-button-all {
		right: 78px;
	}

	.receive-button {
		position: fixed;
		bottom: 8px;
		left: 8px;
		cursor: pointer;
		z-index: 3;
	}

	.export-container span{
		text-decoration: underline;
		cursor: pointer;
	}

	.form-group{
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		margin-bottom: 12px;
		> label {
			margin-right: 8px;
			width: 40px;
		}
		> input {
			width: 100%;
		}
	}

	.form-btn-wrapper{
		display: flex;
		flex-direction: row;
		justify-content: right;
		align-items: center;
		margin-bottom: 12px;
		> button {
			margin-right: 8px;
		}
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