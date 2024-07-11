type BlobInfo = { base64: string; file: File };

const global = window.tinymce.util.Tools.resolve("tinymce.PluginManager");

const regexPictureHeader =
  /{\\pict[\s\S]+?\\bliptag-?\d+(\\blipupi-?\d+)?({\\\*\\blipuid\s?[\da-fA-F]+)?[\s}]*?/;

const regexPicture = new RegExp(
  `(?:(${regexPictureHeader.source}))([\\da-fA-F\\s]+)\\}`,
  ""
);

// base转换file对象
const base64ToFile = (dataurl, filename = "wps_office") => {
  const arr = dataurl.split(","),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

// 16进制转base64
const hexToBase64 = (hexString) =>
  btoa(
    hexString
      .match(/\w{2}/g)
      .map((char) => {
        return String.fromCharCode(parseInt(char, 16));
      })
      .join("")
  );

const getImagesHexSource = (node: any, rtfData: string): any => {
  try {
    // 如果某张图片太大，会报Maximum call stack size exceeded，目前还不知道如何解决
    const imageMatch = rtfData.match(regexPicture);

    const image = imageMatch ? imageMatch[0] : "";

    if (!rtfData || (imageMatch && imageMatch?.index && imageMatch.index < 0)) {
      node.attr("src", "");
      node.attr("alt", "图片加载失败");
      return;
    }

    // 如果找到了就将rtf的内容修改为匹配剩下的rtf内容
    const sliceRtfData = rtfData?.slice(
      (imageMatch?.index || 0) + image.length
    );

    let imageType = "";

    if (image.includes("pngblip")) {
      imageType = "image/png";
    } else if (image.includes("jpegblip")) {
      imageType = "image/jpeg";
    }

    if (imageType) {
      return {
        hex: image.replace(regexPictureHeader, "").replace(/[^\da-fA-F]/g, ""),
        type: imageType,
      };
    }

    return getImagesHexSource(node, sliceRtfData);
  } catch (error) {
    return undefined;
  }
};

const pasteWordPlugin = () => {
  if (global) {
    global.add("pasteword", (editor) => {
      // 编辑器粘贴事件
      editor.on("paste", (e) => {
        const DomParser = editor.parser;

        const clipboardData = e.clipboardData || e.originalEvent.clipboardData;

        const rtfData = clipboardData.getData("text/rtf");

        DomParser.addNodeFilter("img", (nodes) => {
          nodes.forEach((node) => {
            const imgSrc = node.attr("src");

            if (/^file:\/\/\//.test(imgSrc)) {
              const result = getImagesHexSource(node, rtfData);

              if (result) {
                // eslint-disable-next-line max-len
                const newSrc = `data:${result.type};base64,${hexToBase64(
                  result.hex
                )}`;

                node.attr("src", newSrc);
              }
            }
          });
        });
      });
    });
  }
};

pasteWordPlugin();
