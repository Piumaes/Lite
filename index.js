/**
 * Este script é responsável
 * pelas funções que
 * serão executadas
 * no Lite Bot.
 *
 * Aqui é onde você
 * vai definir
 * o que o seu bot
 * vai fazer.
 *
 * @author Dev Gui
 */
const path = require("node:path");
const { menu } = require("./utils/menu");
const { ASSETS_DIR, BOT_NUMBER } = require("./config");
const { errorLog } = require("./utils/terminal");
const { attp, gpt4, playAudio, playVideo } = require("./services/spider-x-api");
const { consultarCep } = require("correios-brasil/dist");
const { image } = require("./services/hercai");

const {
  InvalidParameterError,
  WarningError,
  DangerError,
} = require("./errors");

const {
  checkPrefix,
  deleteTempFile,
  download,
  formatCommand,
  getBuffer,
  getContent,
  getJSON,
  getProfileImageData,
  getRandomName,
  getRandomNumber,
  isLink,
  loadLiteFunctions,
  onlyLettersAndNumbers,
  onlyNumbers,
  removeAccentsAndSpecialCharacters,
  splitByCharacters,
  toUserJid,
} = require("./utils/functions");

const {
  activateAntiLinkGroup,
  deactivateAntiLinkGroup,
  isActiveAntiLinkGroup,
  activateWelcomeGroup,
  isActiveGroup,
  deactivateWelcomeGroup,
  activateGroup,
  deactivateGroup,
} = require("./database/db");

async function runLite({ socket, data }) {
  const functions = loadLiteFunctions({ socket, data });

  if (!functions) {
    return;
  }

  const {
    args,
    body,
    command,
    from,
    fullArgs,
    info,
    isImage,
    isReply,
    isSticker,
    isVideo,
    lite,
    prefix,
    replyJid,
    userJid,
    audioFromURL,
    ban,
    downloadImage,
    downloadSticker,
    downloadVideo,
    errorReact,
    errorReply,
    imageFromFile,
    imageFromURL,
    infoFromSticker,
    isAdmin,
    isOwner,
    react,
    recordState,
    reply,
    sendText,
    stickerFromFile,
    stickerFromURL,
    successReact,
    successReply,
    typingState,
    videoFromURL,
    waitReact,
    waitReply,
    warningReact,
    warningReply,
  } = functions;

  if (!isActiveGroup(from) && !(await isOwner(userJid))) {
    return;
  }

  if (!checkPrefix(prefix)) {
    /**
     * ⏩ Um auto responder simples ⏪
     *
     * Se a mensagem incluir a palavra
     * (ignora maiúsculas e minúsculas) use:
     * body.toLowerCase().includes("palavra")
     *
     * Se a mensagem for exatamente igual a
     * palavra (ignora maiúsculas e minúsculas) use:
     * body.toLowerCase() === "palavra"
     */
    if (body.toLowerCase().includes("c0rt")) {
      await reply("");
      return;
    }
    
    if (body === "0pix") {
      await react("👍");
      await reply("PRODUTOS DE LIMPEZA                                                                                                                                                                                               💢💢💢💢💢💢💢💢💢💢                                                                                                                                                                                             SABÃO LIQUIDO 5 LITROS $30,00                                                                          ========================                                                                            AMACIANTE 5 LITROS $25,00                                                                              ========================                                                                            CLORO BRANCO 5 LITROS $18,00                                                                          =========================                                                                           SABÃO LIQUIDO 5 LITROS $30,00                                                                          ========================                                                                            SABÃO LIQUIDO 5 LITROS $30,00                                                                          ========================                                                                            AMACIANTE 5 LITROS $25,00                                                                              ========================                                                                            CLORO BRANCO 5 LITROS $18,00                                                                          ========================                                                                            SABÃO LIQUIDO 5 LITROS $30,00                                                                          ========================                                                                            SABÃO LIQUIDO 5 LITROS $30,00                                                                          ========================                                                                            AMACIANTE 5 LITROS $25,00                                                                              ========================                                                                            CLORO BRANCO 5 LITROS $18,00                                                                          ========================                                                                            SABÃO LIQUIDO 5 LITROS $30,00");
      return;
    }
    
    if (body === "Boa noite") {
      await react("🌚");
      return;
    }
    
    if (body === "Boa tarde") {
      await react("🌞");
      return;
    }

    if (body === "Bom dia") {
      await react("🌞");
      return;
    }
  }

  /**
   * 🚫 Anti-link 🔗
   */
  if (
    !checkPrefix(prefix) &&
    isActiveAntiLinkGroup(from) &&
    isLink(body) &&
    !(await isAdmin(userJid))
  ) {
    await ban(from, userJid);
    await reply("Anti-link ativado! Você foi removido por enviar um link!");

    return;
  }

  if (!checkPrefix(prefix)) {
    return;
  }

  try {
    /**
     * Aqui você vai definir
     * as funções que
     * o seu bot vai executar via "cases".
     *
     * ⚠ ATENÇÃO ⚠: Não traga funções
     * ou "cases" de
     * outros bots para cá
     * sem saber o que está fazendo.
     *
     * Cada bot tem suas
     * particularidades e,
     * por isso, é importante
     * tomar cuidado.
     * Não nos responsabilizamos
     * por problemas
     * que possam ocorrer ao
     * trazer códigos de outros
     * bots pra cá,
     * na tentativa de adaptação.
     *
     * Toda ajuda será *COBRADA*
     * caso sua intenção
     * seja adaptar os códigos
     * de outro bot para este.
     *
     * ✅ CASES ✅
     */
    switch (removeAccentsAndSpecialCharacters(command?.toLowerCase())) {
      case "antilink":
        if (!args.length) {
          throw new InvalidParameterError(
            "Você precisa digitar 1 ou 0 (ligar ou desligar)!"
          );
        }

        const antiLinkOn = args[0] === "1";
        const antiLinkOff = args[0] === "0";

        if (!antiLinkOn && !antiLinkOff) {
          throw new InvalidParameterError(
            "Você precisa digitar 1 ou 0 (ligar ou desligar)!"
          );
        }

        if (antiLinkOn) {
          activateAntiLinkGroup(from);
        } else {
          deactivateAntiLinkGroup(from);
        }

        await successReact();

        const antiLinkContext = antiLinkOn ? "ativado" : "desativado";

        await reply(`Recurso de anti-link ${antiLinkContext} com sucesso!`);
        break;
      case "attp":
        if (!args.length) {
          throw new InvalidParameterError(
            "Você precisa informar o texto que deseja transformar em figurinha."
          );
        }

        await waitReact();

        const url = await attp(args[0].trim());

        await successReact();

        await stickerFromURL(url);
        break;
      case "ban":
      case "banir":
      case "kick":
        if (!(await isAdmin(userJid))) {
          throw new DangerError(
            "Você não tem permissão para executar este comando!"
          );
        }

        if (!args.length && !isReply) {
          throw new InvalidParameterError(
            "Você precisa mencionar ou marcar um membro!"
          );
        }

        const memberToRemoveJid = isReply ? replyJid : toUserJid(args[0]);
        const memberToRemoveNumber = onlyNumbers(memberToRemoveJid);

        if (
          memberToRemoveNumber.length < 7 ||
          memberToRemoveNumber.length > 15
        ) {
          throw new InvalidParameterError("Número inválido!");
        }

        if (memberToRemoveJid === userJid) {
          throw new DangerError("Você não pode remover você mesmo!");
        }

        const botJid = toUserJid(BOT_NUMBER);

        if (memberToRemoveJid === botJid) {
          throw new DangerError("Você não pode me remover!");
        }

        await ban(from, memberToRemoveJid);

        await successReact();

        await reply("Membro removido com sucesso!");
        break;
      case "cep":
        const cep = args[0];

        if (!cep || ![8, 9].includes(cep.length)) {
          throw new InvalidParameterError(
            "Você precisa enviar um CEP no formato 00000-000 ou 00000000!"
          );
        }

        const data = await consultarCep(cep);

        if (!data.cep) {
          await warningReply("CEP não encontrado!");
          return;
        }

        await successReply(`*Resultado*
        
*CEP*: ${data.cep}
*Logradouro*: ${data.logradouro}
*Complemento*: ${data.complemento}
*Bairro*: ${data.bairro}
*Localidade*: ${data.localidade}
*UF*: ${data.uf}
*IBGE*: ${data.ibge}`);
        break;
      case "gpt4":
      case "gpt":
      case "ia":
      case "lite":
        const text = args[0];

        if (!text) {
          throw new InvalidParameterError(
            "Você precisa me dizer o que eu devo responder!"
          );
        }

        await waitReact();

        const responseText = await gpt4(text);

        await successReply(responseText);
        break;
      case "hidetag":
      case "tagall":
      case "marcar":
        const { participants } = await lite.groupMetadata(from);

        const mentions = participants.map(({ id }) => id);

        await react("📢");

        await sendText(`📢 Marcando todos!\n\n${fullArgs}`, mentions);
        break;
      case "menu":
        await successReact();
        await imageFromFile(
          path.join(ASSETS_DIR, "images", "menu.png"),
          `\n\n${menu()}`
        );
        break;
      case "off":
        if (!(await isOwner(userJid))) {
          throw new DangerError(
            "Você não tem permissão para executar este comando!"
          );
        }

        deactivateGroup(from);

        await successReply("Bot desativado no grupo!");
        break;
      case "image":
        if (!fullArgs.length) {
          throw new WarningError(
            "Por favor, forneça uma descrição para gerar a imagem."
          );
        }

        await waitReact();

        const response = await image(fullArgs);

        await successReact();

        await imageFromURL(response.url);
        break;
      case "on":
        if (!(await isOwner(userJid))) {
          throw new DangerError(
            "Você não tem permissão para executar este comando!"
          );
        }

        activateGroup(from);

        await successReply("Bot ativado no grupo!");
        break;
      case "ping":
        await react("🏓");
        await reply("🏓 Pong!");
        break;
      case "playaudio":
      case "playyt":
      case "play":
        if (!args.length) {
          throw new InvalidParameterError(
            "Você precisa me dizer o que deseja buscar!"
          );
        }

        await waitReact();

        const playAudioData = await playAudio(args[0]);

        if (!playAudioData) {
          await errorReply("Nenhum resultado encontrado!");
          return;
        }

        await successReact();

        await audioFromURL(playAudioData.url);

        break;
      case "playvideo":
        if (!args.length) {
          throw new InvalidParameterError(
            "Você precisa me dizer o que deseja buscar!"
          );
        }

        await waitReact();

        const playVideoData = await playVideo(args[0]);

        if (!playVideoData) {
          await errorReply("Nenhum resultado encontrado!");
          return;
        }

        await successReact();

        await videoFromURL(playVideoData.url);

        break;
      case "sticker":
      case "f":
      case "fig":
      case "figu":
      case "s":
        if (!isImage && !isVideo) {
          throw new InvalidParameterError(
            "Você precisa marcar uma imagem/gif/vídeo ou responder a uma imagem/gif/vídeo"
          );
        }

        await waitReact();
        await infoFromSticker(info);
        break;
      case "welcome":
      case "bemvindo":
      case "boasvinda":
      case "boasvindas":
      case "boavinda":
      case "boavindas":
        if (!args.length) {
          throw new InvalidParameterError(
            "Você precisa digitar 1 ou 0 (ligar ou desligar)!"
          );
        }

        const welcome = args[0] === "1";
        const notWelcome = args[0] === "0";

        if (!welcome && !notWelcome) {
          throw new InvalidParameterError(
            "Você precisa digitar 1 ou 0 (ligar ou desligar)!"
          );
        }

        if (welcome) {
          activateWelcomeGroup(from);
        } else {
          deactivateWelcomeGroup(from);
        }

        await successReact();

        const welcomeContext = welcome ? "ativado" : "desativado";

        await reply(`Recurso de boas-vindas ${welcomeContext} com sucesso!`);
        break;
        case "pix":
        await react("🔑");
        await reply("🔑ℂℍ𝔸𝕍𝔼 ℙ𝕀𝕏 ℂ𝔼𝕃𝕌𝕃𝔸ℝ 📲28999501464                                                                    ℕ𝕆𝕄𝔼: 𝕃𝕌ℂ𝕀𝔸ℕ𝕆 𝔽𝕀𝔾𝕌𝔼𝕀ℝ𝔸                                                                                 𝔹𝔸ℕℂ𝕆: ℕ𝕌𝔹𝔸ℕ𝕂");
        break;
        case "lp":
        await react("🧼");
        await reply("                                                                                                              ℙℝ𝕆𝔻𝕌𝕋𝕆𝕊 𝔻𝔼 𝕃𝕀𝕄ℙ𝔼ℤ𝔸                                                                                                                                                                                             💢💢💢💢💢💢💢💢💢💢                                                                                                                                                                                            𝕊𝔸𝔹𝔸𝕆 𝕃𝕀ℚ𝕌𝕀𝔻𝕆 5 𝕃𝕀𝕋ℝ𝕆𝕊 $30,00                                                                         ========================                                                                            𝔸𝕄𝔸ℂ𝕀𝔸ℕ𝕋𝔼 5 𝕃𝕀𝕋ℝ𝕆𝕊 $25,00                                                                             ========================                                                                            ℂ𝕃𝕆ℝ𝕆 𝔹ℝ𝔸ℕℂ𝕆 5 𝕃𝕀𝕋ℝ𝕆𝕊 $18,00                                                                        =========================                                                                           𝔻𝔼𝕋𝔼ℝ𝔾𝔼ℕ𝕋𝔼 ℕ𝔼𝕌𝕋ℝ𝕆 5 𝕃𝕀𝕋ℝ𝕆𝕊 $25,00                                                                  ========================                                                                            𝕃𝕀𝕄ℙ𝔸 𝔸𝕃𝕌𝕄𝕀ℕ𝕀𝕆 5 𝕃𝕀𝕋ℝ𝕆𝕊 $50,00                                                                       ========================                                                                            𝕊𝔸𝔹𝔸𝕆 𝔼𝕄 ℙ𝔸𝕊𝕋𝔸 500𝔾 $12,00                                                                           ========================                                                                            ℙ𝕀ℕℍ𝕆 𝔾𝔼𝕃 2 𝕃𝕀𝕋ℝ𝕆𝕊 $18,00                                                                              ========================                                                                            𝕄𝕌𝕃𝕋 𝕌𝕊𝕆 𝕋𝕀ℙ𝕆 𝕍𝔼𝕁𝔸 2 𝕃𝕀𝕋ℝ𝕆𝕊 $18,00                                                                  ========================                                                                            𝕃𝕀𝕄ℙ𝔸 𝔸𝕃𝕌𝕄𝕀ℕ𝕀𝕆 2 𝕃𝕀𝕋ℝ𝕆𝕊 $20,00                                                                       ========================                                                                            𝕊𝔸𝔹𝕆ℕ𝔼𝕋𝔼 𝕃𝕀ℚ𝕌𝕀𝔻𝕆 1 𝕃𝕀𝕋ℝ𝕆𝕊 $18,00                                                                     ========================                                                                            𝕊𝕆𝔻𝔸 ℂ𝔸𝕌𝕊𝕋𝕀ℂ𝔸 1𝕂𝔾 $30,00                                                                              ========================                                                                            𝕊𝕆𝔻𝔸 ℂ𝔸𝕌𝕊𝕋𝕀ℂ𝔸 𝕃𝕀ℚ𝕌𝕀𝔻𝔸 1 𝕃𝕀𝕋ℝ𝕆 $20,00                                                                                                                                                                                                                                                                                                                                                                                        https://maroba-produtos-de-limpeza.rdi.store/products/cd8e9367-8aa3-4297-9012-46a169c519fe                                               ");
        break;
    }
    // ❌ Não coloque nada abaixo ❌
  } catch (error) {
    /**
     * ❌ Não coloque nada abaixo ❌
     * Este bloco é responsável por tratar
     * os erros que ocorrerem durante a execução
     * das "cases".
     */
    if (error instanceof InvalidParameterError) {
      await warningReply(`Parâmetros inválidos! ${error.message}`);
    } else if (error instanceof WarningError) {
      await warningReply(error.message);
    } else if (error instanceof DangerError) {
      await errorReply(error.message);
    } else {
      errorLog(`Erro ao executar comando!\n\nDetalhes: ${error.message}`);

      await errorReply(
        `Ocorreu um erro ao executar o comando ${command.name}!

📄 *Detalhes*: ${error.message}`
      );
    }
    // ❌ Não coloque nada abaixo ❌
  }
}

module.exports = { runLite };
