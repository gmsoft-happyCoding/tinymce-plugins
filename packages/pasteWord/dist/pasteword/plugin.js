(function () {
    'use strict';

    var global = window.tinymce.util.Tools.resolve("tinymce.PluginManager");
    var regexPictureHeader = /{\\pict[\s\S]+?\\bliptag-?\d+(\\blipupi-?\d+)?({\\\*\\blipuid\s?[\da-fA-F]+)?[\s}]*?/;
    var regexPicture = new RegExp("(?:(".concat(regexPictureHeader.source, "))([\\da-fA-F\\s]+)\\}"), "");
    // 16进制转base64
    var hexToBase64 = function (hexString) {
        return btoa(hexString
            .match(/\w{2}/g)
            .map(function (char) {
            return String.fromCharCode(parseInt(char, 16));
        })
            .join(""));
    };
    var getImagesHexSource = function (node, rtfData) {
        // 如果某张图片太大，会报Maximum call stack size exceeded，目前还不知道如何解决
        var imageMatch = rtfData === null || rtfData === void 0 ? void 0 : rtfData.match(regexPicture);
        var image = imageMatch ? imageMatch[0] : "";
        if (!rtfData || (imageMatch && (imageMatch === null || imageMatch === void 0 ? void 0 : imageMatch.index) && imageMatch.index < 0)) {
            node.attr("src", "");
            node.attr("alt", "图片加载失败");
            return;
        }
        // 如果找到了就将rtf的内容修改为匹配剩下的rtf内容
        var sliceRtfData = rtfData === null || rtfData === void 0 ? void 0 : rtfData.slice(((imageMatch === null || imageMatch === void 0 ? void 0 : imageMatch.index) || 0) + image.length);
        var imageType = "";
        if (image.includes("pngblip")) {
            imageType = "image/png";
        }
        else if (image.includes("jpegblip")) {
            imageType = "image/jpeg";
        }
        if (imageType) {
            return {
                hex: image.replace(regexPictureHeader, "").replace(/[^\da-fA-F]/g, ""),
                type: imageType,
            };
        }
        return getImagesHexSource(node, sliceRtfData);
    };
    var pasteWordPlugin = function () {
        if (global) {
            global.add("pasteword", function (editor) {
                // 编辑器粘贴事件
                editor.on("paste", function (e) {
                    var DomParser = editor.parser;
                    var clipboardData = e.clipboardData || e.originalEvent.clipboardData;
                    var rtfData = clipboardData.getData("text/rtf");
                    DomParser.addNodeFilter("img", function (nodes) {
                        nodes.forEach(function (node) {
                            var imgSrc = node.attr("src");
                            if (/^file:\/\/\//.test(imgSrc)) {
                                var result = getImagesHexSource(node, rtfData);
                                if (result) {
                                    // eslint-disable-next-line max-len
                                    var newSrc = "data:".concat(result.type, ";base64,").concat(hexToBase64(result.hex));
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

})();
//# sourceMappingURL=plugin.js.map
