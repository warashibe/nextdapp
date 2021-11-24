import pkg from "../src/index"
import assert from "assert"
describe("Test", () => {
  describe("#init", () => {
    it("should import", async () => {
      assert.equal(typeof pkg, "object")
    })
  })
})
