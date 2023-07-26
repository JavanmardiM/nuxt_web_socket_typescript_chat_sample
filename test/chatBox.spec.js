import { mount } from "@vue/test-utils";
import chatBox from "@/components/chatBox.vue";

describe("chatBox.vue", () => {
  let wrapper;
  beforeEach(() => {
    wrapper = mount(chatBox, {
      //   methods: { connectWebSocket: () => {} }
    });
  });
  it("renders", () => {
    expect(wrapper.exists()).toBeTruthy();
  });
});
