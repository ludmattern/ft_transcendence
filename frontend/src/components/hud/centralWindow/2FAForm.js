import { createComponent } from "/src/utils/component.js";

export const twoFAForm = createComponent({
  tag: "twoFAForm",

  render: () => `
    <div id="login-form" class="form-container flex-column justify-content-around text-center active">
      <h5>PILOT IDENTIFICATION - TWO FACTOR AUTHENTIFICATION</h5>
      <span class="background-central-span">
        <form action="#" method="post" class="w-100">
          <div class="form-group">
            <label class="mb-3" for="pilot-id">Code</label>
            <input type="text" id="pilot-id" name="pilot-id" class="form-control" required />
          </div>
          <button class="btn bi bi-check">SUBMIT</button>
          <button class="btn bi bi-right-arrow">SEND AGAIN</button>
        </form>
      </span>
    </div>
  `,

});
