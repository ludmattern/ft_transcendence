import { createComponent } from "/src/utils/component.js";

export const soloContent = createComponent({
  tag: "soloContent",

  // Générer le HTML
  render: () => `
	<section class="p-5 flex-grow-1" style="background-color: #111111; max-height: 700px; overflow: auto;">
		<h2 class="text-white text-center">So, You Think You Can Win against AI ?</h2>
		<p class="text-secondary text-center">How adorable. Choose your doomed battlefield and prepare for utter humiliation.</p>

		<div class="col tab-content">
			<!-- Page Test Section -->
			<div class="tab-panel fade show active" id="pageTest" role="tabpanel">
				<!-- Submenu Content -->
				<div class="tab-panel fade show active" id="submenu1" role="tabpanel">
					<fieldset class="mb-3 text-white">
						<legend class="h4">Pointless Battle Settings</legend>

						<div class="mb-3">
							<label for="battlefield" class="form-label">Select Where You’ll Be Annihilated</label>
							<select class="form-select" id="battlefield" aria-describedby="battlefieldHelp">
								<option value="map1">The Pit of Futility</option>
								<option value="map2">Asteroid Wasteland of Despair</option>
								<option value="map3">Nebula of Certain Defeat</option>
								<option value="map4">The Black Hole of No Return</option>
							</select>
							<small id="battlefieldHelp" class="text-secondary">Not that it matters. You're losing anyway.</small>
						</div>

						<div class="mb-3">
							<label for="difficulty" class="form-label">Select How Fast You’ll Regret This</label>
							<select class="form-select" id="difficulty" aria-describedby="difficultyHelp">
								<option value="hard">Painful</option>
								<option value="very-hard">Excruciating</option>
								<option value="insane">Instant Regret</option>
							</select>
							<small id="difficultyHelp" class="text-secondary">Seriously? You're making it worse for yourself.</small>
						</div>

						<div class="mb-3 form-check">
							<input class="form-check-input" type="checkbox" id="liabilityCheckbox">
							<label class="form-check-label" for="liabilityCheckbox">
								I fully acknowledge my inevitable defeat and accept total humiliation.
							</label>
						</div>

						<div class="text-center">
							<button class="mt-3 btn btn-danger btn-lg">Proceed to Your Doom</button>
						</div>
					</fieldset>
				</div>
			</div>
		</div>
	</section>
  `,
});
