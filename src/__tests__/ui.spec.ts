import { describe, it, expect, vi, beforeEach } from "vitest"
import { mount } from "@vue/test-utils"
import App from "../App.vue"

// helper: make fetch always succeed and return empty arrays
function mockFetchAlwaysEmpty() {
  vi.stubGlobal("fetch", vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
      text: () => Promise.resolve(""),
    } as any)
  ))
}

beforeEach(() => {
  vi.unstubAllGlobals()
  mockFetchAlwaysEmpty()
})

describe("Frontend smoke tests", () => {
  it("renders topbar title", () => {
    const wrapper = mount(App)
    expect(wrapper.text()).toContain("Bar Ops Core")
  })

  it("shows Drinks tab by default", () => {
    const wrapper = mount(App)
    expect(wrapper.text()).toContain("Drinks")
  })

  it("can switch to Stock tab", async () => {
    const wrapper = mount(App)
    await wrapper.findAll("button").find(b => b.text() === "Stock")!.trigger("click")
    expect(wrapper.text()).toContain("Stock")
  })

  it("can switch to Sales tab", async () => {
    const wrapper = mount(App)
    await wrapper.findAll("button").find(b => b.text() === "Sales")!.trigger("click")
    expect(wrapper.text()).toContain("Sales")
  })

  it("calls fetch at least once (API load)", async () => {
    mount(App)
    // allow promises from onMounted to run
    await Promise.resolve()
    expect((globalThis.fetch as any)).toHaveBeenCalled()
  })
})
