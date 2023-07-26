<template>
  <div class="content-container">
    <div>
      <div class="status" v-if="!isWSConnected">
        Please Check Your Internet Connection
      </div>
      <div class="status" v-else-if="isWSReconnecting">
        Reconnecting, Please Wait...
      </div>
    </div>
    <section v-if="isChatOpen" class="chatbox-popup">
      <header class="chatbox-popup__header">
        <aside>
          <h1>type your massage</h1>
        </aside>
      </header>
      <main class="chatbox-popup__main" ref="chatbox">
        <div v-if="!isWSConnected" class="chatbox-message-warn">
          disconnected, try later...
        </div>
        <div v-for="(msgItem, index) in massages" :key="index">
          <p
            class="chatbox-message__container"
            :class="msgItem.type == 'receiver' ? 'justify-end' : ''"
          >
            <span
              class="chatbox-message"
              :class="
                msgItem.type == 'receiver' ? 'chatbox-message__receiver' : ''
              "
              >{{ msgItem.value }}</span
            >
          </p>
        </div>
      </main>
      <footer class="chatbox-popup__footer">
        <aside style="flex:10">
          <input
            v-model.trim="massageTxt"
            type="text"
            placeholder="Type here..."
            autofocus
            @keyup.enter="sendMessage"
          />
        </aside>
        <aside @click="sendMessage" style="flex:1;">
          <img src="../static/logo/send.svg" width="25" height="20" />
        </aside>
      </footer>
    </section>

    <div @click="toggleChat" class="custom-btn">
      <img src="../static/logo/chat.svg" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "@nuxtjs/composition-api";

export default defineComponent({
  setup() {
    const url = ref("wss://echo.websocket.org");
    const massageTxt = ref("");
    const connection = ref();
    const isChatOpen = ref(false);
    const massages = ref([] as any);
    const chatbox = ref();
    const isWSConnected = ref(false);
    const isWSReconnecting = ref(false);

    onMounted(() => {
      connectWebSocket();
    });

    function sendMessage() {
      if (isMsgValid()) {
        addMassage("sender", massageTxt.value);
        connection.value.send(massageTxt.value);
        massageTxt.value = "";
      }
    }
    function toggleChat() {
      isChatOpen.value = !isChatOpen.value;
    }
    function scrollToEnd() {
      try {
        chatbox.value.scrollTop = chatbox.value.scrollHeight;
      } catch (error) {
        console.log("error", error);
      }
    }
    function addMassage(type: string, value: string) {
      massages.value.push({ type, value });
      scrollToEnd();
    }
    function isMsgValid(): boolean {
      if (isWSConnected && !!massageTxt.value.trim()) {
        if (massageTxt.value.toLowerCase() === "restart") {
          restartWebSocket();
          return false;
        } else return true;
      }
      return false;
    }
    function restartWebSocket() {
      connection.value.close();
      console.log("onnection closed", connection.value);
      massageTxt.value = "";
      massages.value = [];
      isChatOpen.value = false;
      isWSReconnecting.value = true;
      connectWebSocket()
        .then(() => {
          isChatOpen.value = true;
          isWSReconnecting.value = false;
        })
        .catch(error => {
          console.log(" error", error);
          isWSReconnecting.value = false;
        });
    }
    function connectWebSocket() {
      return new Promise(function(resolve, reject) {
        connection.value = new WebSocket(url.value);
        connection.value.onopen = function(event: any) {
          console.log("successfully connected, event:", event);
          isWSConnected.value = true;
          resolve(connection);
        };
        connection.value.onmessage = function(event: any) {
          console.log("msg received, event:", event);
          addMassage("receiver", event.data);
        };
        connection.value.onerror = function(err: any) {
          reject(err);
          isWSConnected.value = false;
        };
      });
    }

    return {
      isChatOpen,
      massageTxt,
      massages,
      isWSConnected,
      isWSReconnecting,
      chatbox,
      sendMessage,
      toggleChat
    };
  }
});
</script>

<style scoped>
.content-container {
  overflow: auto;
}
body {
  height: 100%;
  overflow: auto;
}
p {
  margin: 2px 0;
}
.custom-btn {
  position: fixed;
  bottom: 50px;
  right: 50px;
  background: #3e8353;
  border-radius: 50%;
  color: white;
  padding: 20px;
  cursor: pointer;
  box-shadow: 0px 3px 16px 0px rgb(0 0 0 / 60%), 0 3px 1px -2px rgb(0 0 0 / 20%),
    0 1px 5px 0 rgb(0 0 0 / 12%);
  width: 25px;
  height: 25px;
  text-align: center;
  justify-content: center;
  align-items: center;
  display: flex;
}

.chatbox-popup {
  display: flex;
  position: absolute;
  box-shadow: 5px 5px 25px 0 rgba(46, 61, 73, 0.2);
  flex-direction: column;
  bottom: 135px;
  right: 50px;
  width: 380px;
  height: auto;
  background-color: #fff;
  border-radius: 16px;
}
@media (max-width: 400px) {
  .chatbox-popup {
    width: 100%;
    position: absolute;
    right: 0px;
    bottom: 135px;
  }
}
.chatbox-popup .chatbox-popup__header {
  box-sizing: border-box;
  display: flex;
  width: 100%;
  height: 70px;
  padding: 16px;
  color: #fff;
  background-color: #3e8353;
  align-items: center;
  justify-content: space-around;
  border-top-right-radius: 12px;
  border-top-left-radius: 12px;
  text-align: start;
}

.chatbox-popup .chatbox-popup__main {
  box-sizing: border-box;
  width: 100%;
  padding: 15px 16px;
  line-height: 18px;
  color: #888;
  text-align: center;
  height: 200px;
  overflow-y: auto;
}

.chatbox-message__container {
  display: flex;
}
.justify-end {
  justify-content: flex-end;
}
.chatbox-message {
  padding: 10px;
  background: #ecf1f8;
  font-size: 13px;
  border-radius: 5px;
  margin-bottom: 3px;
}
.chatbox-message__receiver {
  background: #3e8353;
  color: #fff;
}

.chatbox-popup .chatbox-popup__footer {
  box-sizing: border-box;
  display: flex;
  width: 100%;
  padding: 16px;
  border-top: 1px solid #ddd;
  align-items: center;
  justify-content: space-around;
  border-bottom-right-radius: 12px;
  border-bottom-left-radius: 12px;
}

body {
  margin: 0;
  padding: 0;
  font-family: "Lato", sans-serif;
  background-color: #f6f7f9;
}

h1 {
  margin: 0;
  font-size: 16px;
  line-height: 1;
}

button {
  color: inherit;
  background-color: transparent;
  border: 0;
  outline: 0 !important;
  cursor: pointer;
}

input {
  box-sizing: border-box;
  width: 100%;
  margin: 0;
  height: 16px;
  padding: 0 8px;
  font-family: inherit;
  font-size: 16px;
  line-height: 16px;
  color: #888;
  background-color: none;
  border: 0;
  outline: 0 !important;
  resize: none;
  overflow: hidden;
}
input::-moz-placeholder {
  color: #888;
}
input:-ms-input-placeholder {
  color: #888;
}
input::placeholder {
  color: #888;
}
.chatbox-message-warn {
  color: red;
  font-size: 14px;
  text-align: center;
}
.status {
  text-align: center;
  font-size: 20px;
  padding-top: 30px;
}
</style>
