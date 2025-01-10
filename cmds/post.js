const fs = require("fs-extra");
const axios = require("axios");

const replyHandlers = {};

module.exports = {
    name: 'post',
    description: 'Create a new post on Facebook',
    async execute(api, event) {
        const { threadID, messageID, senderID } = event;
        const uuid = getGUID();
        const formData = {
            "input": {
                "composer_entry_point": "inline_composer",
                "composer_source_surface": "timeline",
                "idempotence_token": uuid + "_FEED",
                "source": "WWW",
                "attachments": [],
                "audience": {
                    "privacy": {
                        "allow": [],
                        "base_state": "FRIENDS",
                        "deny": [],
                        "tag_expansion_state": "UNSPECIFIED"
                    }
                },
                "message": {
                    "ranges": [],
                    "text": ""
                },
                "with_tags_ids": [],
                "inline_activities": [],
                "explicit_place_id": "0",
                "text_format_preset_id": "0",
                "logging": {
                    "composer_session_id": uuid
                },
                "tracking": [
                    null
                ],
                "actor_id": api.getCurrentUserID(),
                "client_mutation_id": Math.floor(Math.random() * 17)
            },
            "displayCommentsFeedbackContext": null,
            "displayCommentsContextEnableComment": null,
            "displayCommentsContextIsAdPreview": null,
            "displayCommentsContextIsAggregatedShare": null,
            "displayCommentsContextIsStorySet": null,
            "feedLocation": "TIMELINE",
            "feedbackSource": 0,
            "focusCommentID": null,
            "gridMediaWidth": 230,
            "groupID": null,
            "scale": 3,
            "privacySelectorRenderLocation": "COMET_STREAM",
            "renderLocation": "timeline",
            "useDefaultActor": false,
            "inviteShortLinkKey": null,
            "isFeed": false,
            "isFundraiser": false,
            "isFunFactPost": false,
            "isGroup": false,
            "isTimeline": true,
            "isSocialLearning": false,
            "isPageNewsFeed": false,
            "isProfileReviews": false,
            "isWorkSharedDraft": false,
            "UFI2CommentsProvider_commentsKey": "ProfileCometTimelineRoute",
            "hashtag": null,
            "canUserManageOffers": false
        };

        api.sendMessage(`Choose an audience that can see this article of yours\n1. Everyone\n2. Friend\n3. Only me`, threadID, (e, info) => {
            replyHandlers[info.messageID] = {
                commandName: 'post',
                messageID: info.messageID,
                author: senderID,
                formData,
                type: "whoSee"
            };
        }, messageID);
    },
    async onReply(event, api) {
        const handleReply = replyHandlers[event.messageID];
        if (!handleReply || event.senderID != handleReply.author) return;

        const { type, formData } = handleReply;
        const { threadID, messageID, attachments, body } = event;
        const botID = api.getCurrentUserID();

        async function uploadAttachments(attachments) {
            let uploads = [];
            for (const attachment of attachments) {
                const form = {
                    file: attachment
                };
                uploads.push(api.httpPostFormData(`https://www.facebook.com/profile/picture/upload/?profile_id=${botID}&photo_source=57&av=${botID}`, form));
            }
            uploads = await Promise.all(uploads);
            return uploads;
        }

        if (type == "whoSee") {
            if (!["1", "2", "3"].includes(body)) return api.sendMessage('Please choose one of the three options above', threadID, messageID);
            formData.input.audience.privacy.base_state = body == 1 ? "EVERYONE" : body == 2 ? "FRIENDS" : "SELF";
            api.unsendMessage(handleReply.messageID, () => {
                api.sendMessage(`Reply to this message with the content of the article. If you want to leave it blank, please reply with 0.`, threadID, (e, info) => {
                    replyHandlers[info.messageID] = {
                        commandName: 'post',
                        messageID: info.messageID,
                        author: handleReply.author,
                        formData,
                        type: "content"
                    };
                }, messageID);
            });
        } else if (type == "content") {
            if (event.body != "0") formData.input.message.text = event.body;
            api.unsendMessage(handleReply.messageID, () => {
                api.sendMessage(`Reply to this message with a photo or video (you can send multiple attachments). To post without attachments, reply with 0.`, threadID, (e, info) => {
                    replyHandlers[info.messageID] = {
                        commandName: 'post',
                        messageID: info.messageID,
                        author: handleReply.author,
                        formData,
                        type: "media"
                    };
                }, messageID);
            });
        } else if (type == "media") {
            if (event.body != "0") {
                const allStreamFile = [];
                for (const attach of attachments) {
                    if (attach.type === "photo") {
                        const getFile = (await axios.get(attach.url, { responseType: "arraybuffer" })).data;
                        fs.writeFileSync(__dirname + `/cache/imagePost.png`, Buffer.from(getFile));
                        allStreamFile.push(fs.createReadStream(__dirname + `/cache/imagePost.png`));
                    } else if (attach.type === "video") {
                        const videoFile = await axios.get(attach.url, { responseType: "stream" });
                        const videoPath = __dirname + `/cache/videoPost.mp4`;
                        videoFile.data.pipe(fs.createWriteStream(videoPath));
                        allStreamFile.push(fs.createReadStream(videoPath));
                    }
                }
                const uploadFiles = await uploadAttachments(allStreamFile);
                for (let result of uploadFiles) {
                    if (typeof result == "string") result = JSON.parse(result.replace("for (;;);", ""));

                    if (result.payload && result.payload.fbid) {
                        formData.input.attachments.push({
                            "photo": {
                                "id": result.payload.fbid.toString(),
                            }
                        });
                    }
                }
            }

            const form = {
                av: botID,
                fb_api_req_friendly_name: "ComposerStoryCreateMutation",
                fb_api_caller_class: "RelayModern",
                doc_id: "7711610262190099",
                variables: JSON.stringify(formData)
            };

            api.httpPost('https://www.facebook.com/api/graphql/', form, (e, info) => {
                api.unsendMessage(handleReply.messageID);
                delete replyHandlers[handleReply.messageID];
                try {
                    if (e) throw e;
                    if (typeof info == "string") info = JSON.parse(info.replace("for (;;);", ""));
                    const postID = info.data.story_create.story.legacy_story_hideable_id;
                    const urlPost = info.data.story_create.story.url;
                    if (!postID) throw info.errors;
                    try {
                        fs.unlinkSync(__dirname + "/cache/imagePost.png");
                        fs.unlinkSync(__dirname + "/cache/videoPost.mp4");
                    } catch (e) {}
                    return api.sendMessage(`» Post created successfully\n» postID: ${postID}\n» urlPost: ${urlPost}`, threadID, messageID);
                } catch (e) {
                    return api.sendMessage(`Post creation failed, please try again later`, threadID, messageID);
                }
            });
        }
    }
};

function getGUID() {
    var sectionLength = Date.now();
    var id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = Math.floor((sectionLength + Math.random() * 16) % 16);
        sectionLength = Math.floor(sectionLength / 16);
        var _guid = (c == "x" ? r : (r & 7) | 8).toString(16);
        return _guid;
    });
    return id;
}
