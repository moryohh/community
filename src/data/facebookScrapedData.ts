export interface RawApifyPost {
  facebookUrl?: string;
  inputUrl?: string;
  attachments?: Array<{
    thumbnail?: string;
    __typename?: string;
    photo_image?: {
      uri: string;
      height: number;
      width: number;
    };
    id?: string;
    url?: string;
  }>;
  topComments?: Array<{
    commentId?: string;
    id?: string;
    text?: string;
    threadingDepth?: number;
    profileId?: string;
    profileName?: string;
    commentUrl?: string;
  }>;
  facebookId?: string;
  legacyId?: string;
  id: string;
  user?: {
    id: string;
    name: string;
  };
  photoCount?: number;
  feedbackId?: string;
  commentsCount?: number;
  topReactionsCount?: number;
  reactionLikeCount?: number;
  reactionLoveCount?: number;
  reactionHahaCount?: number;
  reactionAngryCount?: number;
  likesCount?: number;
  sharesCount?: number;
  time?: string;
  timeSource?: string;
  unitTime?: string | null;
  additionalPhotoCount?: number;
  url?: string;
  isMarketplaceListing?: boolean;
  groupTitle?: string;
  text?: string;
}

export const FACEBOOK_SCRAPED_DATASET: RawApifyPost[] = [
  {
    "facebookUrl": "https://www.facebook.com/groups/238104155756275/",
    "inputUrl": "https://www.facebook.com/groups/238104155756275/",
    "attachments": [
      {
        "thumbnail": "https://scontent-iad3-2.xx.fbcdn.net/v/t39.30808-6/783031870_1811395806971156_6001586171324381318_n.jpg?stp=dst-jpg_tt6&cstp=mx1793x2048&ctp=s590x590&_nc_cat=111&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=Jr-Xsmd5IyAQ7kNvwHygxN5&_nc_oc=AdonLG96-fBYYcjOgIAM9255fF-YT2gNwJuDQuVZuJYElnEN3On_qke_nED0TSk4Pvo&_nc_zt=23&_nc_ht=scontent-iad3-2.xx&_nc_gid=O4468NvFQpAQ2S4sGtS_1g&_nc_ss=72289&oh=00_AQEaF9NygrC6SBZFDxrJZPUA4i32EF_z2RP8qxf0gjR70A&oe=6A8F7DF3",
        "__typename": "Photo",
        "photo_image": {
          "uri": "https://scontent-iad3-2.xx.fbcdn.net/v/t39.30808-6/783031870_1811395806971156_6001586171324381318_n.jpg?stp=dst-jpg_tt6&cstp=mx1793x2048&ctp=s590x590&_nc_cat=111&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=Jr-Xsmd5IyAQ7kNvwHygxN5&_nc_oc=AdonLG96-fBYYcjOgIAM9255fF-YT2gNwJuDQuVZuJYElnEN3On_qke_nED0TSk4Pvo&_nc_zt=23&_nc_ht=scontent-iad3-2.xx&_nc_gid=O4468NvFQpAQ2S4sGtS_1g&_nc_ss=72289&oh=00_AQEaF9NygrC6SBZFDxrJZPUA4i32EF_z2RP8qxf0gjR70A&oe=6A8F7DF3",
          "height": 590,
          "width": 517
        },
        "id": "1811396650304405",
        "url": "https://www.facebook.com/photo.php?fbid=1811396650304405&set=gm.1064575923109090&type=3"
      },
      {
        "thumbnail": "https://scontent-iad3-1.xx.fbcdn.net/v/t39.30808-6/783592798_1811395876971149_7081957578008542468_n.jpg?stp=dst-jpg_tt6&cstp=mx1946x2048&ctp=s590x590&_nc_cat=101&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=2nZ38IDpZw4Q7kNvwH-jJPP&_nc_oc=AdqozU5ljlmSjrr6sB0r0gPWowUWN_S-T60uooQEB6OFa9hVsepZLIy3pYPeWyCYpY4&_nc_zt=23&_nc_ht=scontent-iad3-1.xx&_nc_gid=O4468NvFQpAQ2S4sGtS_1g&_nc_ss=72289&oh=00_AQGEE1xB7SZfss18USA2CyKcgtXvBxaPV-oAwsAH4MjhEQ&oe=6A8F8727",
        "__typename": "Photo",
        "photo_image": {
          "uri": "https://scontent-iad3-1.xx.fbcdn.net/v/t39.30808-6/783592798_1811395876971149_7081957578008542468_n.jpg?stp=dst-jpg_tt6&cstp=mx1946x2048&ctp=s590x590&_nc_cat=101&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=2nZ38IDpZw4Q7kNvwH-jJPP&_nc_oc=AdqozU5ljlmSjrr6sB0r0gPWowUWN_S-T60uooQEB6OFa9hVsepZLIy3pYPeWyCYpY4&_nc_zt=23&_nc_ht=scontent-iad3-1.xx&_nc_gid=O4468NvFQpAQ2S4sGtS_1g&_nc_ss=72289&oh=00_AQGEE1xB7SZfss18USA2CyKcgtXvBxaPV-oAwsAH4MjhEQ&oe=6A8F8727",
          "height": 590,
          "width": 561
        },
        "id": "1811396646971072",
        "url": "https://www.facebook.com/photo.php?fbid=1811396646971072&set=gm.1064575926442423&type=3"
      }
    ],
    "topComments": [
      {
        "commentId": "1064648393101843",
        "id": "Y29tbWVudDoxMDY0NTc1OTE5Nzc1NzU3XzEwNjQ2NDgzOTMxMDE4NDM=",
        "text": "يحيى المشاكس",
        "threadingDepth": 0,
        "profileId": "100043022624904",
        "profileName": "Sattar Sabri",
        "commentUrl": "https://www.facebook.com/groups/238104155756275/permalink/1064575919775757/?comment_id=1064648393101843"
      }
    ],
    "facebookId": "238104155756275",
    "legacyId": "1064575919775757",
    "id": "UzpfSTEwMDA0MzAyMjYyNDkwNDpWSzoxMDY0NTc1OTE5Nzc1NzU3",
    "user": {
      "id": "100043022624904",
      "name": "Sattar Sabri"
    },
    "photoCount": 2,
    "feedbackId": "ZmVlZGJhY2s6MTA2NDU3NTkxOTc3NTc1Nw==",
    "commentsCount": 1,
    "topReactionsCount": 0,
    "likesCount": 0,
    "sharesCount": 0,
    "time": "2026-08-22T12:34:01.000Z",
    "timeSource": "story",
    "unitTime": null,
    "additionalPhotoCount": 0,
    "url": "https://www.facebook.com/groups/238104155756275/permalink/1064575919775757/",
    "isMarketplaceListing": false,
    "groupTitle": "السادس العلمي 26🤍27"
  },
  {
    "facebookUrl": "https://www.facebook.com/groups/238104155756275/",
    "inputUrl": "https://www.facebook.com/groups/238104155756275/",
    "attachments": [],
    "topComments": [
      {
        "commentId": "1064572629776086",
        "id": "Y29tbWVudDoxMDY0NTYxMjMzMTEwNTU5XzEwNjQ1NzI2Mjk3NzYwODY=",
        "text": "أكو مسربات بدون الميم",
        "threadingDepth": 0,
        "profileId": "2255320625265158",
        "profileName": "Anonymous participant 145",
        "commentUrl": "https://www.facebook.com/groups/238104155756275/permalink/1064561233110559/?comment_id=1064572629776086"
      },
      {
        "commentId": "1064567379776611",
        "id": "Y29tbWVudDoxMDY0NTYxMjMzMTEwNTU5XzEwNjQ1NjczNzk3NzY2MTE=",
        "text": "هي مال مسربات",
        "threadingDepth": 0,
        "profileId": "100055649086858",
        "profileName": "Wo Rl",
        "commentUrl": "https://www.facebook.com/groups/238104155756275/permalink/1064561233110559/?comment_id=1064567379776611"
      }
    ],
    "facebookId": "238104155756275",
    "legacyId": "1064561233110559",
    "id": "UzpfSTYxNTkxNTkxMzI4NzMzOlZLOjEwNjQ1NjEyMzMxMTA1NTk=",
    "user": {
      "id": "pfbid04vyr7enWxMckmW2pQ64HurijcnYQ7aJAcNRouAkFj4RZKNjaqfLwUNhj7o9qGSoxl",
      "name": "مريم العبيدي"
    },
    "text": "مسربات رفل الزبيدي اكو؟",
    "feedbackId": "ZmVlZGJhY2s6MTA2NDU2MTIzMzExMDU1OQ==",
    "commentsCount": 2,
    "topReactionsCount": 1,
    "reactionLikeCount": 2,
    "likesCount": 2,
    "sharesCount": 0,
    "time": "2026-08-22T12:11:59.000Z",
    "timeSource": "story",
    "unitTime": null,
    "photoCount": 0,
    "additionalPhotoCount": 0,
    "url": "https://www.facebook.com/groups/238104155756275/permalink/1064561233110559/",
    "isMarketplaceListing": false,
    "groupTitle": "السادس العلمي 26🤍27"
  },
  {
    "facebookUrl": "https://www.facebook.com/groups/238104155756275/",
    "inputUrl": "https://www.facebook.com/groups/238104155756275/",
    "attachments": [],
    "topComments": [
      {
        "commentId": "1064554329777916",
        "id": "Y29tbWVudDoxMDY0NTIwNzk5NzgxMjY5XzEwNjQ1NTQzMjk3Nzc5MTY=",
        "text": "اني قريت على جعفر الحسني شفته ممتاز والله",
        "threadingDepth": 0,
        "profileId": "1995749437777742",
        "profileName": "SupportiveApricot9833",
        "commentUrl": "https://www.facebook.com/groups/238104155756275/permalink/1064520799781269/?comment_id=1064554329777916"
      },
      {
        "commentId": "1064531826446833",
        "id": "Y29tbWVudDoxMDY0NTIwNzk5NzgxMjY5XzEwNjQ1MzE4MjY0NDY4MzM=",
        "text": "مراجعة سالم",
        "threadingDepth": 0,
        "profileId": "3610916865739438",
        "profileName": "RadiantRaccoon3485",
        "commentUrl": "https://www.facebook.com/groups/238104155756275/permalink/1064520799781269/?comment_id=1064531826446833"
      }
    ],
    "facebookId": "238104155756275",
    "legacyId": "1064520799781269",
    "id": "UzpfSTYxNTg5MTAxNDc0ODQwOlZLOjEwNjQ1MjA3OTk3ODEyNjk=",
    "user": {
      "id": "pfbid0E31dyYvqcvxjoTWTUaurHEB355wfixMdKMbcVrs5bjr5uJd21TJjn7ULsJyFgYiLl",
      "name": "Butter Fly"
    },
    "text": "السلام عليكم منو احسن مدرس ع اليوتيوب يشرح مسائل الوراثة",
    "feedbackId": "ZmVlZGJhY2s6MTA2NDUyMDc5OTc4MTI2OQ==",
    "commentsCount": 2,
    "topReactionsCount": 0,
    "likesCount": 0,
    "sharesCount": 0,
    "time": "2026-08-22T11:16:40.000Z",
    "timeSource": "story",
    "unitTime": null,
    "photoCount": 0,
    "additionalPhotoCount": 0,
    "url": "https://www.facebook.com/groups/238104155756275/permalink/1064520799781269/",
    "isMarketplaceListing": false,
    "groupTitle": "السادس العلمي 26🤍27"
  },
  {
    "facebookUrl": "https://www.facebook.com/groups/238104155756275/",
    "inputUrl": "https://www.facebook.com/groups/238104155756275/",
    "attachments": [
      {
        "thumbnail": "https://scontent.fsap13-1.fna.fbcdn.net/v/t39.30808-6/783375306_122123088423389687_7484626544769416203_n.jpg?stp=cp6_dst-jpg_tt6&cstp=mx1290x1170&ctp=p552x414&_nc_cat=102&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=5alQ6fvrsN0Q7kNvwEHdjdr&_nc_oc=AdoC6ue3un7iD0xerQAFhaOw_IDI7moDSTfmOeVzW39u9MLyLD8DZgHbNLN1Rqpvl-w&_nc_zt=23&_nc_ht=scontent.fsap13-1.fna&_nc_gid=ICEwxZ0V8IPmXVIHfBfRmA&_nc_ss=7c289&oh=00_AQHDLOwHLILye-ramzqAweMgsAdYYpA21TxpZVg7dY_fiw&oe=6A8F89DD",
        "__typename": "Photo",
        "photo_image": {
          "uri": "https://scontent.fsap13-1.fna.fbcdn.net/v/t39.30808-6/783375306_122123088423389687_7484626544769416203_n.jpg?stp=cp6_dst-jpg_tt6&cstp=mx1290x1170&ctp=p552x414&_nc_cat=102&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=5alQ6fvrsN0Q7kNvwEHdjdr&_nc_oc=AdoC6ue3un7iD0xerQAFhaOw_IDI7moDSTfmOeVzW39u9MLyLD8DZgHbNLN1Rqpvl-w&_nc_zt=23&_nc_ht=scontent.fsap13-1.fna&_nc_gid=ICEwxZ0V8IPmXVIHfBfRmA&_nc_ss=7c289&oh=00_AQHDLOwHLILye-ramzqAweMgsAdYYpA21TxpZVg7dY_fiw&oe=6A8F89DD",
          "height": 501,
          "width": 552
        },
        "id": "122123088417389687",
        "url": "https://www.facebook.com/photo/?fbid=122123088417389687&set=gm.1064498899783459&idorvanity=238104155756275"
      }
    ],
    "topComments": [],
    "facebookId": "238104155756275",
    "legacyId": "1064498899783459",
    "id": "UzpfSTYxNTkxNjkwNjM2MzI4OlZLOjEwNjQ0OTg4OTk3ODM0NTk=",
    "user": {
      "id": "61591690636328",
      "name": "صلاح الدين "
    },
    "feedbackId": "ZmVlZGJhY2s6MTA2NDQ5ODg5OTc4MzQ1OQ==",
    "commentsCount": 22,
    "topReactionsCount": 1,
    "reactionLikeCount": 23,
    "likesCount": 23,
    "sharesCount": 0,
    "time": "2026-08-22T10:44:23.000Z",
    "timeSource": "story",
    "unitTime": null,
    "photoCount": 1,
    "additionalPhotoCount": 0,
    "url": "https://www.facebook.com/groups/238104155756275/permalink/1064498899783459/",
    "isMarketplaceListing": false,
    "groupTitle": "السادس العلمي 26🤍27"
  },
  {
    "facebookUrl": "https://www.facebook.com/groups/238104155756275/",
    "inputUrl": "https://www.facebook.com/groups/238104155756275/",
    "attachments": [],
    "topComments": [
      {
        "commentId": "1064561143110568",
        "id": "Y29tbWVudDoxMDY0NTA0ODI5NzgyODY2XzEwNjQ1NjExNDMxMTA1Njg=",
        "text": "بجاه الحسين كون اطلع ناجح برياضيات🙏",
        "threadingDepth": 0,
        "profileId": "pfbid0wJgJrPa1nUoEniDZfEv3VcJhq5RRUzxP8vDymJKP4w8SNayA8r1iM4YuT3y7ju7nl",
        "profileName": "عبدالله الكعبي",
        "commentUrl": "https://www.facebook.com/groups/238104155756275/permalink/1064504829782866/?comment_id=1064561143110568"
      },
      {
        "commentId": "1064520689781280",
        "id": "Y29tbWVudDoxMDY0NTA0ODI5NzgyODY2XzEwNjQ1MjA2ODk3ODEyODA=",
        "text": "إن شاء الله باجر عبر رسالة SMS",
        "threadingDepth": 0,
        "profileId": "1751425955984964",
        "profileName": "BronzeShrimp914",
        "commentUrl": "https://www.facebook.com/groups/238104155756275/permalink/1064504829782866/?comment_id=1064520689781280"
      }
    ],
    "facebookId": "238104155756275",
    "legacyId": "1064504829782866",
    "id": "UzpfSTEwMDA4Mzc5ODEyMjMwNzpWSzoxMDY0NTA0ODI5NzgyODY2",
    "user": {
      "id": "pfbid023AYJ96Jesa1SPFhHosVHmzp7cMcZaUoSc7XLDAb6pwFDFPazSHGXPigKhhigwfRgl",
      "name": "ستار جابر"
    },
    "text": "السلام عليكم\nالاعتراضات طلعت لوبعدها",
    "feedbackId": "ZmVlZGJhY2s6MTA2NDUwNDgyOTc4Mjg2Ng==",
    "commentsCount": 17,
    "topReactionsCount": 1,
    "reactionLikeCount": 35,
    "likesCount": 35,
    "sharesCount": 0,
    "time": "2026-08-22T10:52:47.000Z",
    "timeSource": "story",
    "unitTime": null,
    "photoCount": 0,
    "additionalPhotoCount": 0,
    "url": "https://www.facebook.com/groups/238104155756275/permalink/1064504829782866/",
    "isMarketplaceListing": false,
    "groupTitle": "السادس العلمي 26🤍27"
  },
  {
    "facebookUrl": "https://www.facebook.com/groups/238104155756275/",
    "inputUrl": "https://www.facebook.com/groups/238104155756275/",
    "attachments": [
      {
        "thumbnail": "https://scontent.fsap13-1.fna.fbcdn.net/v/t39.30808-6/779957615_1002351236172984_1162679467128877606_n.jpg?stp=dst-jpg_tt6&cstp=mx1408x768&ctp=s960x960&_nc_cat=103&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=X5JMUNWp4McQ7kNvwELtsUs&_nc_oc=AdpgUSZ7e0zCTVZLh11PVFXBSB9p_Kfl1jwJDnoDSjuxjVetlVtpb8aKkIjhQy2BfAc&_nc_zt=23&_nc_ht=scontent.fsap13-1.fna&_nc_gid=ICEwxZ0V8IPmXVIHfBfRmA&_nc_ss=7c289&oh=00_AQH17gvZVQXuJp_TXxvNcvSFEt4kj9VKiCKcJCdtcTpxCg&oe=6A8F9A07",
        "__typename": "Photo",
        "photo_image": {
          "uri": "https://scontent.fsap13-1.fna.fbcdn.net/v/t39.30808-6/779957615_1002351236172984_1162679467128877606_n.jpg?stp=dst-jpg_tt6&cstp=mx1408x768&ctp=s960x960&_nc_cat=103&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=X5JMUNWp4McQ7kNvwELtsUs&_nc_oc=AdpgUSZ7e0zCTVZLh11PVFXBSB9p_Kfl1jwJDnoDSjuxjVetlVtpb8aKkIjhQy2BfAc&_nc_zt=23&_nc_ht=scontent.fsap13-1.fna&_nc_gid=ICEwxZ0V8IPmXVIHfBfRmA&_nc_ss=7c289&oh=00_AQH17gvZVQXuJp_TXxvNcvSFEt4kj9VKiCKcJCdtcTpxCg&oe=6A8F9A07",
          "height": 524,
          "width": 960
        },
        "id": "1002351229506318",
        "url": "https://www.facebook.com/photo/?fbid=1002351229506318&set=gm.1470404555040205&idorvanity=1367065822040746"
      }
    ],
    "topComments": [],
    "facebookId": "238104155756275",
    "legacyId": "1064513519781997",
    "id": "UzpfSTEwMDA5MTk0MzUxMzI2NjpWSzoxMDY0NTEzNTE5NzgxOTk3",
    "user": {
      "id": "pfbid0GkPBAMryZcPy1PA6YktRQCceUp5yevMm7vTUnSTrgQgAHAf9RgNdZe19SJagyaD2l",
      "name": "جنات عمري"
    },
    "feedbackId": "ZmVlZGJhY2s6MTA2NDUxMzUxOTc4MTk5Nw==",
    "commentsCount": 0,
    "topReactionsCount": 0,
    "likesCount": 0,
    "sharesCount": 0,
    "time": "2026-08-22T11:06:32.000Z",
    "timeSource": "story",
    "unitTime": null,
    "photoCount": 1,
    "additionalPhotoCount": 0,
    "url": "https://www.facebook.com/groups/238104155756275/permalink/1064513519781997/",
    "isMarketplaceListing": false,
    "groupTitle": "السادس العلمي 26🤍27"
  },
  {
    "facebookUrl": "https://www.facebook.com/groups/238104155756275/",
    "inputUrl": "https://www.facebook.com/groups/238104155756275/",
    "attachments": [
      {
        "thumbnail": "https://scontent.flhr9-1.fna.fbcdn.net/v/t39.30808-6/783286606_1566975588779338_3614794492337529551_n.jpg?stp=dst-jpg_tt6&cstp=mx2048x1817&ctp=s590x590&_nc_cat=105&ccb=1-7&_nc_sid=833d8c&_nc_ohc=nRMwVMPieZMQ7kNvwE75Hio&_nc_oc=AdoAtaLfsE1ob9blQ_ny-BwzUzsOIbHjj70skiC7XstUgZVBSkMCEGC3jjNfefev5_M&_nc_zt=23&_nc_ht=scontent.flhr9-1.fna&_nc_gid=PrNm2ixqYOz0WN-9AHAgIg&_nc_ss=72289&oh=00_AQFBVxH4LgwB0wNSHgAHQF_ZJRcwNs57B4jlwRpkXgXiTQ&oe=6A8F97C2",
        "__typename": "Photo",
        "photo_image": {
          "uri": "https://scontent.flhr9-1.fna.fbcdn.net/v/t39.30808-6/783286606_1566975588779338_3614794492337529551_n.jpg?stp=dst-jpg_tt6&cstp=mx2048x1817&ctp=s590x590&_nc_cat=105&ccb=1-7&_nc_sid=833d8c&_nc_ohc=nRMwVMPieZMQ7kNvwE75Hio&_nc_oc=AdoAtaLfsE1ob9blQ_ny-BwzUzsOIbHjj70skiC7XstUgZVBSkMCEGC3jjNfefev5_M&_nc_zt=23&_nc_ht=scontent.flhr9-1.fna&_nc_gid=PrNm2ixqYOz0WN-9AHAgIg&_nc_ss=72289&oh=00_AQFBVxH4LgwB0wNSHgAHQF_ZJRcwNs57B4jlwRpkXgXiTQ&oe=6A8F97C2",
          "height": 523,
          "width": 590
        },
        "id": "1566975585446005"
      },
      {
        "thumbnail": "https://scontent.flhr9-1.fna.fbcdn.net/v/t39.30808-6/780909918_1566975652112665_2296986516048376469_n.jpg?stp=dst-jpg_tt6&cstp=mx1080x1071&ctp=s590x590&_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=EzD7nnVXyfIQ7kNvwE9yk0H&_nc_oc=AdoGQr7UAho3tLSUnhlaieuWViI9Y33AaYlKIRAYs5OTHAHT_1S1zGZYAFeXjrFoLS4&_nc_zt=23&_nc_ht=scontent.flhr9-1.fna&_nc_gid=PrNm2ixqYOz0WN-9AHAgIg&_nc_ss=72289&oh=00_AQGJp2KApNOItdTVgiPEetvwHbbLg3R7BnrE-1LjgXV20g&oe=6A8F877D",
        "__typename": "Photo",
        "photo_image": {
          "uri": "https://scontent.flhr9-1.fna.fbcdn.net/v/t39.30808-6/780909918_1566975652112665_2296986516048376469_n.jpg?stp=dst-jpg_tt6&cstp=mx1080x1071&ctp=s590x590&_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=EzD7nnVXyfIQ7kNvwE9yk0H&_nc_oc=AdoGQr7UAho3tLSUnhlaieuWViI9Y33AaYlKIRAYs5OTHAHT_1S1zGZYAFeXjrFoLS4&_nc_zt=23&_nc_ht=scontent.flhr9-1.fna&_nc_gid=PrNm2ixqYOz0WN-9AHAgIg&_nc_ss=72289&oh=00_AQGJp2KApNOItdTVgiPEetvwHbbLg3R7BnrE-1LjgXV20g&oe=6A8F877D",
          "height": 585,
          "width": 590
        },
        "id": "1566975648779332"
      },
      {
        "thumbnail": "https://scontent.flhr9-1.fna.fbcdn.net/v/t39.30808-6/781137459_1566975698779327_5330869233822831475_n.jpg?stp=dst-jpg_tt6&cstp=mx1122x1394&ctp=s590x590&_nc_cat=103&ccb=1-7&_nc_sid=833d8c&_nc_ohc=rf-ijq0RUGEQ7kNvwFk8_AX&_nc_oc=Ado3LdL8hL2jqNeE9iC3H5MFgx-Gm56SeN1Syk11nTpGyWHTBTLCnxYdmopDpURT9Vo&_nc_zt=23&_nc_ht=scontent.flhr9-1.fna&_nc_gid=PrNm2ixqYOz0WN-9AHAgIg&_nc_ss=72289&oh=00_AQHG8TEh3K-7mK0icaHLemTpdwsIv7vhOmK5H7U32f214w&oe=6A8F7309",
        "__typename": "Photo",
        "photo_image": {
          "uri": "https://scontent.flhr9-1.fna.fbcdn.net/v/t39.30808-6/781137459_1566975698779327_5330869233822831475_n.jpg?stp=dst-jpg_tt6&cstp=mx1122x1394&ctp=s590x590&_nc_cat=103&ccb=1-7&_nc_sid=833d8c&_nc_ohc=rf-ijq0RUGEQ7kNvwFk8_AX&_nc_oc=Ado3LdL8hL2jqNeE9iC3H5MFgx-Gm56SeN1Syk11nTpGyWHTBTLCnxYdmopDpURT9Vo&_nc_zt=23&_nc_ht=scontent.flhr9-1.fna&_nc_gid=PrNm2ixqYOz0WN-9AHAgIg&_nc_ss=72289&oh=00_AQHG8TEh3K-7mK0icaHLemTpdwsIv7vhOmK5H7U32f214w&oe=6A8F7309",
          "height": 590,
          "width": 475
        },
        "id": "1566975692112661"
      }
    ],
    "topComments": [],
    "facebookId": "238104155756275",
    "legacyId": "1064488213117861",
    "id": "UzpfSTEwMDA2NDAwNzM1Njc2MDpWSzoxMDY0NDg4MjEzMTE3ODYx",
    "user": {
      "id": "100064007356760",
      "name": "مركز  الصفار للتدريس الخصوصي ودورات التقوية"
    },
    "text": "#إعلان \nتدريس خصوصي لجميع المراحل الدراسية \nأساتذة متميزون ولجميع المواد \nاللغة العربية \nاللغة الإنكليزية \nالرياضيات \nالفيزياء \nالكيمياء \n\nزورونا تجدون الافضل 💯💯💯 \nالعنوان / بابل حي الجزائر مقابل مدرسة الطريق الى المئة الأهلية \nللاستفسار الاتصال على الرقم التالي 07816422695\nواتس آب وتلكرام \nنجاحكم مضمون معنا 💯💗\nمحمد الصفار \n الأستاذة صفا حسين العسكري \nالست نور حمزه",
    "photoCount": 3,
    "feedbackId": "ZmVlZGJhY2s6MTA2NDQ4ODIxMzExNzg2MQ==",
    "commentsCount": 0,
    "topReactionsCount": 0,
    "likesCount": 0,
    "sharesCount": 0,
    "time": "2026-08-22T10:26:42.000Z",
    "timeSource": "story",
    "unitTime": null,
    "additionalPhotoCount": 0,
    "url": "https://www.facebook.com/groups/238104155756275/permalink/1064488213117861/",
    "isMarketplaceListing": false,
    "groupTitle": "السادس العلمي 26🤍27"
  },
  {
    "facebookUrl": "https://www.facebook.com/groups/238104155756275/",
    "inputUrl": "https://www.facebook.com/groups/238104155756275/",
    "attachments": [],
    "topComments": [
      {
        "commentId": "1064555119777837",
        "id": "Y29tbWVudDoxMDY0NDk3NzU2NDUwMjQwXzEwNjQ1NTUxMTk3Nzc4Mzc=",
        "text": "بالكرخ لحد هسة ماكو مراكز امتحانية ومحد يعرف. وين يمتحنون الطلبة المدارس نسألهم كالوا ماكو. اي شي من التربية",
        "threadingDepth": 0,
        "profileId": "28455979150652412",
        "profileName": "ChattyBeet7086",
        "commentUrl": "https://www.facebook.com/groups/238104155756275/permalink/1064497756450240/?comment_id=1064555119777837"
      },
      {
        "commentId": "1064506989782650",
        "id": "Y29tbWVudDoxMDY0NDk3NzU2NDUwMjQwXzEwNjQ1MDY5ODk3ODI2NTA=",
        "text": "وين الله نمتحن سوى ونخلص",
        "threadingDepth": 0,
        "profileId": "4469805399963507",
        "profileName": "OrangeKangaroo8610",
        "commentUrl": "https://www.facebook.com/groups/238104155756275/permalink/1064497756450240/?comment_id=1064506989782650"
      }
    ],
    "facebookId": "238104155756275",
    "legacyId": "1064497756450240",
    "id": "UzpfSTM4MDUzMzM4NDEwOTQ3NTU3OlZLOjEwNjQ0OTc3NTY0NTAyNDA=",
    "user": {
      "id": "38053338410947557",
      "name": "SupportiveMango2922"
    },
    "text": "مادام طلعت مراقبة المدرسين ووزعوهم اليوم اعتقد ماكو تاجيل بالجدول نفس الموعد نمتحن باذن الله",
    "feedbackId": "ZmVlZGJhY2s6MTA2NDQ5Nzc1NjQ1MDI0MA==",
    "commentsCount": 20,
    "topReactionsCount": 1,
    "reactionLikeCount": 58,
    "likesCount": 58,
    "sharesCount": 0,
    "time": "2026-08-22T10:42:23.000Z",
    "timeSource": "story",
    "unitTime": null,
    "photoCount": 0,
    "additionalPhotoCount": 0,
    "url": "https://www.facebook.com/groups/238104155756275/permalink/1064497756450240/",
    "isMarketplaceListing": false,
    "groupTitle": "السادس العلمي 26🤍27"
  },
  {
    "facebookUrl": "https://www.facebook.com/groups/238104155756275/",
    "inputUrl": "https://www.facebook.com/groups/238104155756275/",
    "attachments": [],
    "topComments": [
      {
        "commentId": "1064483883118294",
        "id": "Y29tbWVudDoxMDY0NDc4NDg5Nzg1NTAwXzEwNjQ0ODM4ODMxMTgyOTQ=",
        "text": "حيدر عبد الائمة",
        "threadingDepth": 0,
        "profileId": "1074585688643169",
        "profileName": "ChipperLemur5275",
        "commentUrl": "https://www.facebook.com/groups/238104155756275/permalink/1064478489785500/?comment_id=1064483883118294"
      },
      {
        "commentId": "1064511023115580",
        "id": "Y29tbWVudDoxMDY0NDc4NDg5Nzg1NTAwXzEwNjQ1MTEwMjMxMTU1ODA=",
        "text": "حيدر عبد الائمة أو محمد قاسم",
        "threadingDepth": 0,
        "profileId": "pfbid02nobRTMgWc57HuHG8fQvNnhHcFSFi2VK9DuqseWLSRHJkyXDFDkXcyHFJCeQtw9VLl",
        "profileName": "وردة البيضاء",
        "commentUrl": "https://www.facebook.com/groups/238104155756275/permalink/1064478489785500/?comment_id=1064511023115580"
      }
    ],
    "facebookId": "238104155756275",
    "legacyId": "1064478489785500",
    "id": "UzpfSTE2MjQ5NjcwNjU4MTkwODg6Vks6MTA2NDQ3ODQ4OTc4NTUwMA==",
    "user": {
      "id": "1624967065819088",
      "name": "ExhilaratingHeron6155"
    },
    "text": "صلاب عله منوا اعتمد مراجعه مركزه   رياضيات الفصل الخامس اني ماقريه واريد بي درجه كامله",
    "feedbackId": "ZmVlZGJhY2s6MTA2NDQ3ODQ4OTc4NTUwMA==",
    "commentsCount": 5,
    "topReactionsCount": 1,
    "reactionLikeCount": 2,
    "likesCount": 2,
    "sharesCount": 0,
    "time": "2026-08-22T10:12:38.000Z",
    "timeSource": "story",
    "unitTime": null,
    "photoCount": 0,
    "additionalPhotoCount": 0,
    "url": "https://www.facebook.com/groups/238104155756275/permalink/1064478489785500/",
    "isMarketplaceListing": false,
    "groupTitle": "السادس العلمي 26🤍27"
  },
  {
    "facebookUrl": "https://www.facebook.com/groups/238104155756275/",
    "inputUrl": "https://www.facebook.com/groups/238104155756275/",
    "attachments": [],
    "topComments": [
      {
        "commentId": "1064544076445608",
        "id": "Y29tbWVudDoxMDY0NDczMDA2NDUyNzE1XzEwNjQ1NDQwNzY0NDU2MDg=",
        "text": "جاوبو شبيكم😒",
        "threadingDepth": 0,
        "profileId": "1058634133693804",
        "profileName": "نستلاية",
        "commentUrl": "https://www.facebook.com/groups/238104155756275/permalink/1064473006452715/?comment_id=1064544076445608"
      },
      {
        "commentId": "1064621026437913",
        "id": "Y29tbWVudDoxMDY0NDczMDA2NDUyNzE1XzEwNjQ2MjEwMjY0Mzc5MTM=",
        "text": "اهمشي كملي الخطوات صحيح والأرقام خلي بكيفج ينقصوج درجه او درجتين اكثر شي",
        "threadingDepth": 0,
        "profileId": "pfbid029ZxtVboG6e7e3qMtzGp2YsmFbigwgeDnEX8uSfZRAR2nCmhQZFDai6MRB1R8Gpqzl",
        "profileName": "يحيى كريم عزيز",
        "commentUrl": "https://www.facebook.com/groups/238104155756275/permalink/1064473006452715/?comment_id=1064621026437913"
      }
    ],
    "facebookId": "238104155756275",
    "legacyId": "1064473006452715",
    "id": "UzpfSTEwNTg2MzQxMzM2OTM4MDQ6Vks6MTA2NDQ3MzAwNjQ1MjcxNQ==",
    "user": {
      "id": "1058634133693804",
      "name": "نستلاية"
    },
    "text": "طلاب اني طالبه خارجي دور ثاني وعندي صعوبه بالعمليات الحسابيه مال مسائل وكلش بطيئه بيها اذا بامتحان الفيزياء وكيمياء اكتب قانون المسئله واطبق بدون ناتج او ناتج غلط\nينقصوتي هواي؟؟",
    "feedbackId": "ZmVlZGJhY2s6MTA2NDQ3MzAwNjQ1MjcxNQ==",
    "commentsCount": 2,
    "topReactionsCount": 1,
    "reactionLikeCount": 2,
    "likesCount": 2,
    "sharesCount": 0,
    "time": "2026-08-22T10:04:09.000Z",
    "timeSource": "story",
    "unitTime": null,
    "photoCount": 0,
    "additionalPhotoCount": 0,
    "url": "https://www.facebook.com/groups/238104155756275/permalink/1064473006452715/",
    "isMarketplaceListing": false,
    "groupTitle": "السادس العلمي 26🤍27"
  },
  {
    "facebookUrl": "https://www.facebook.com/groups/238104155756275/",
    "inputUrl": "https://www.facebook.com/groups/238104155756275/",
    "attachments": [
      {
        "thumbnail": "https://scontent.fmar6-1.fna.fbcdn.net/v/t39.30808-6/782172172_1035491189242899_8800835160368869256_n.jpg?stp=dst-jpg_tt6&cstp=mx1091x1536&ctp=s720x720&_nc_cat=107&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=tQ6B7xs8iI8Q7kNvwFo8o_t&_nc_oc=AdrkZWjMB6zotd-BCveZKHTFc2Qbm-qhKWEQ5-zCyrdZ1VaC6gqq_hSeaVF2kPkr3hA&_nc_zt=23&_nc_ht=scontent.fmar6-1.fna&_nc_gid=hOooK7J_GFVxq7k-ex8Prw&_nc_ss=72289&oh=00_AQHfYKCBRaAVZYOQNdYMSQGeO3y1Woxm6F4RYhpVVPkm4w&oe=6A8F77B3",
        "__typename": "Photo",
        "photo_image": {
          "uri": "https://scontent.fmar6-1.fna.fbcdn.net/v/t39.30808-6/782172172_1035491189242899_8800835160368869256_n.jpg?stp=dst-jpg_tt6&cstp=mx1091x1536&ctp=s720x720&_nc_cat=107&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=tQ6B7xs8iI8Q7kNvwFo8o_t&_nc_oc=AdrkZWjMB6zotd-BCveZKHTFc2Qbm-qhKWEQ5-zCyrdZ1VaC6gqq_hSeaVF2kPkr3hA&_nc_zt=23&_nc_ht=scontent.fmar6-1.fna&_nc_gid=hOooK7J_GFVxq7k-ex8Prw&_nc_ss=72289&oh=00_AQHfYKCBRaAVZYOQNdYMSQGeO3y1Woxm6F4RYhpVVPkm4w&oe=6A8F77B3",
          "height": 720,
          "width": 511
        },
        "id": "1035491182576233",
        "url": "https://www.facebook.com/photo/?fbid=1035491182576233&set=gm.1063592726540743&idorvanity=238104155756275"
      }
    ],
    "topComments": [],
    "facebookId": "238104155756275",
    "legacyId": "1063592726540743",
    "id": "UzpfSTE3MzA0MTA2NzgxNjU3ODY6Vks6MTA2MzU5MjcyNjU0MDc0Mw==",
    "user": {
      "id": "1730410678165786",
      "name": "Ahmed2584683"
    },
    "text": "⚫جواب صحيح \n🔴كتبت بس القوانين \n🟡ما خليت فارغ \nللعلامة ماخذ 37\nهل انجح بل اعتراض او لا",
    "feedbackId": "ZmVlZGJhY2s6MTA2MzU5MjcyNjU0MDc0Mw==",
    "commentsCount": 0,
    "topReactionsCount": 1,
    "reactionLikeCount": 4,
    "likesCount": 4,
    "sharesCount": 0,
    "time": "2026-08-22T09:08:54.000Z",
    "timeSource": "story",
    "unitTime": null,
    "photoCount": 1,
    "additionalPhotoCount": 0,
    "url": "https://www.facebook.com/groups/238104155756275/permalink/1063592726540743/",
    "isMarketplaceListing": false,
    "groupTitle": "السادس العلمي 26🤍27"
  },
  {
    "facebookUrl": "https://www.facebook.com/groups/238104155756275/",
    "inputUrl": "https://www.facebook.com/groups/238104155756275/",
    "attachments": [
      {
        "thumbnail": "https://scontent.fcgh35-1.fna.fbcdn.net/v/t39.30808-6/782924710_1035499419242076_5138263310537495619_n.jpg?stp=dst-jpg_tt6&cstp=mx1091x1536&ctp=s720x720&_nc_cat=108&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=Z7sZDgEdVGMQ7kNvwFmbwpb&_nc_oc=AdrSpwQD7p1zfn2Uy-YqJunAc4j8qpysd5wLYWv0WLSga3sT6jjabF3KqRMZXOFfyOo&_nc_zt=23&_nc_ht=scontent.fcgh35-1.fna&_nc_gid=rRsQfEFESs75YEReVh_YSA&_nc_ss=72289&oh=00_AQFJBquwmcs2dr1O5OotfM-l4xtChl-CuxBG93u308rBhw&oe=6A8F7585",
        "__typename": "Photo",
        "photo_image": {
          "uri": "https://scontent.fcgh35-1.fna.fbcdn.net/v/t39.30808-6/782924710_1035499419242076_5138263310537495619_n.jpg?stp=dst-jpg_tt6&cstp=mx1091x1536&ctp=s720x720&_nc_cat=108&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=Z7sZDgEdVGMQ7kNvwFmbwpb&_nc_oc=AdrSpwQD7p1zfn2Uy-YqJunAc4j8qpysd5wLYWv0WLSga3sT6jjabF3KqRMZXOFfyOo&_nc_zt=23&_nc_ht=scontent.fcgh35-1.fna&_nc_gid=rRsQfEFESs75YEReVh_YSA&_nc_ss=72289&oh=00_AQFJBquwmcs2dr1O5OotfM-l4xtChl-CuxBG93u308rBhw&oe=6A8F7585",
          "height": 720,
          "width": 511
        },
        "id": "1035499415908743",
        "url": "https://www.facebook.com/photo/?fbid=1035499415908743&set=gm.1063600386539977&idorvanity=238104155756275"
      }
    ],
    "topComments": [
      {
        "commentId": "1064464946453521",
        "id": "Y29tbWVudDoxMDYzNjAwMzg2NTM5OTc3XzEwNjQ0NjQ5NDY0NTM1MjE=",
        "text": "هو بعده موجود اعتراض",
        "threadingDepth": 0,
        "profileId": "1042864151898037",
        "profileName": "CleverTiger9027",
        "commentUrl": "https://www.facebook.com/groups/238104155756275/permalink/1063600386539977/?comment_id=1064464946453521"
      },
      {
        "commentId": "1064446039788745",
        "id": "Y29tbWVudDoxMDYzNjAwMzg2NTM5OTc3XzEwNjQ0NDYwMzk3ODg3NDU=",
        "text": "50تاخذ",
        "threadingDepth": 0,
        "profileId": "pfbid0vJFYVCRgwq2MAShm4MjeKs4aqaic1UP6MKJFqUao3YGTJDZBoZoh6qK1sfQF2q8Rl",
        "profileName": "احمد رياض",
        "commentUrl": "https://www.facebook.com/groups/238104155756275/permalink/1063600386539977/?comment_id=1064446039788745"
      }
    ],
    "facebookId": "238104155756275",
    "legacyId": "1063600386539977",
    "id": "UzpfSTIxMDE2NDU3NzcwOTA3NzA6Vks6MTA2MzYwMDM4NjUzOTk3Nw==",
    "user": {
      "id": "2101645777090770",
      "name": "Ahmed2584683"
    },
    "text": "⚫جواب صحيح \n🔴كتبت بس القوانين \n🟡ما خليت فارغ \nللعلامة ماخذ 37\nهل انجح بل اعتراض او لا",
    "feedbackId": "ZmVlZGJhY2s6MTA2MzYwMDM4NjUzOTk3Nw==",
    "commentsCount": 4,
    "topReactionsCount": 1,
    "reactionLikeCount": 7,
    "likesCount": 7,
    "sharesCount": 0,
    "time": "2026-08-22T09:08:51.000Z",
    "timeSource": "story",
    "unitTime": null,
    "photoCount": 1,
    "additionalPhotoCount": 0,
    "url": "https://www.facebook.com/groups/238104155756275/permalink/1063600386539977/",
    "isMarketplaceListing": false,
    "groupTitle": "السادس العلمي 26🤍27"
  },
  {
    "facebookUrl": "https://www.facebook.com/groups/238104155756275/",
    "inputUrl": "https://www.facebook.com/groups/238104155756275/",
    "attachments": [
      {
        "thumbnail": "https://scontent.fcgh52-1.fna.fbcdn.net/v/t39.30808-6/782172190_1035499772575374_3188999424456625447_n.jpg?stp=dst-jpg_tt6&cstp=mx1091x1536&ctp=s720x720&_nc_cat=111&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=3ActaK6sFu0Q7kNvwGNcWFI&_nc_oc=AdpksuwZtLzn0YPgmdCKSHq9uc3Kn43Hq1F7E8fu5kZ98i1gX7n8qJc5xSVgd81tSog&_nc_zt=23&_nc_ht=scontent.fcgh52-1.fna&_nc_gid=rRsQfEFESs75YEReVh_YSA&_nc_ss=72289&oh=00_AQFTkTed65a8ZCmUJ16AUHCZK2vzu_HNVqCO8x9XrxCn4A&oe=6A8F6D92",
        "__typename": "Photo",
        "photo_image": {
          "uri": "https://scontent.fcgh52-1.fna.fbcdn.net/v/t39.30808-6/782172190_1035499772575374_3188999424456625447_n.jpg?stp=dst-jpg_tt6&cstp=mx1091x1536&ctp=s720x720&_nc_cat=111&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=3ActaK6sFu0Q7kNvwGNcWFI&_nc_oc=AdpksuwZtLzn0YPgmdCKSHq9uc3Kn43Hq1F7E8fu5kZ98i1gX7n8qJc5xSVgd81tSog&_nc_zt=23&_nc_ht=scontent.fcgh52-1.fna&_nc_gid=rRsQfEFESs75YEReVh_YSA&_nc_ss=72289&oh=00_AQFTkTed65a8ZCmUJ16AUHCZK2vzu_HNVqCO8x9XrxCn4A&oe=6A8F6D92",
          "height": 720,
          "width": 511
        },
        "id": "1035499765908708",
        "url": "https://www.facebook.com/photo/?fbid=1035499765908708&set=gm.1063600649873284&idorvanity=238104155756275"
      }
    ],
    "topComments": [
      {
        "commentId": "1064493509783998",
        "id": "Y29tbWVudDoxMDYzNjAwNjQ5ODczMjg0XzEwNjQ0OTM1MDk3ODM5OTg=",
        "text": "اني حاسبتها 51 واجت 30 وقدمت اعتراض بعد ماادري خايفه يطلع مطابق بس مااعتمدت على الاعتراضات جاي اقراء لدور الثاني خاف كلشي يصير \nوالكيمياء هم كذالك ٣٤💔",
        "threadingDepth": 0,
        "profileId": "pfbid02rikXguXjcRYe8fdN6KfpDwUhZkFg2c38ssyXoE7JoFtPVYPfKciTTkpyuks8yJZQl",
        "profileName": "ᏚᏁᏫᏔ ᏔᎻᎥᎿᎬ.",
        "commentUrl": "https://www.facebook.com/groups/238104155756275/permalink/1063600649873284/?comment_id=1064493509783998"
      },
      {
        "commentId": "1064543136445702",
        "id": "Y29tbWVudDoxMDYzNjAwNjQ5ODczMjg0XzEwNjQ1NDMxMzY0NDU3MDI=",
        "text": "احياء 80 اجت 37 ضلم تحكيمي",
        "threadingDepth": 0,
        "profileId": "1807332746953192",
        "profileName": "RadiantLychee4372",
        "commentUrl": "https://www.facebook.com/groups/238104155756275/permalink/1063600649873284/?comment_id=1064543136445702"
      }
    ],
    "facebookId": "238104155756275",
    "legacyId": "1063600649873284",
    "id": "UzpfSTQ1NTQ4ODk3NTQ4Mjk2MTM6Vks6MTA2MzYwMDY0OTg3MzI4NA==",
    "user": {
      "id": "4554889754829613",
      "name": "Ahmed2584683"
    },
    "text": "⚫جواب صحيح \n🔴كتبت بس القوانين \n🟡ما خليت فارغ \nللعلامة ماخذ 37\nهل انجح بل اعتراض او لا\nادمن وافق",
    "feedbackId": "ZmVlZGJhY2s6MTA2MzYwMDY0OTg3MzI4NA==",
    "commentsCount": 6,
    "topReactionsCount": 2,
    "reactionLikeCount": 9,
    "reactionLoveCount": 1,
    "likesCount": 10,
    "sharesCount": 0,
    "time": "2026-08-22T09:08:50.000Z",
    "timeSource": "story",
    "unitTime": null,
    "photoCount": 1,
    "additionalPhotoCount": 0,
    "url": "https://www.facebook.com/groups/238104155756275/permalink/1063600649873284/",
    "isMarketplaceListing": false,
    "groupTitle": "السادس العلمي 26🤍27"
  },
  {
    "facebookUrl": "https://www.facebook.com/groups/238104155756275/",
    "inputUrl": "https://www.facebook.com/groups/238104155756275/",
    "attachments": [
      {
        "thumbnail": "https://scontent.fuio10-2.fna.fbcdn.net/v/t39.30808-6/781487481_1602289621632973_8670414733872909644_n.jpg?stp=dst-jpg_tt6&cstp=mx688x687&ctp=p526x296&_nc_cat=102&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=rIrsBRt_7JIQ7kNvwGZPw_i&_nc_oc=AdolBQQ_AbHxIgVGOyI0I_GztoI-D3dmtUZc_WFpwGwCIZk3k2XZ8ROAZO0E-7ikml0&_nc_zt=23&_nc_ht=scontent.fuio10-2.fna&_nc_gid=p_IujJN4tHetoxRvUAymow&_nc_ss=72289&oh=00_AQEDmvdinebD44WSILPzsUNhLfnHGE7yl2KrpnXQ7U58qQ&oe=6A8F72A0",
        "__typename": "Photo",
        "photo_image": {
          "uri": "https://scontent.fuio10-2.fna.fbcdn.net/v/t39.30808-6/781487481_1602289621632973_8670414733872909644_n.jpg?stp=dst-jpg_tt6&cstp=mx688x687&ctp=p526x296&_nc_cat=102&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=rIrsBRt_7JIQ7kNvwGZPw_i&_nc_oc=AdolBQQ_AbHxIgVGOyI0I_GztoI-D3dmtUZc_WFpwGwCIZk3k2XZ8ROAZO0E-7ikml0&_nc_zt=23&_nc_ht=scontent.fuio10-2.fna&_nc_gid=p_IujJN4tHetoxRvUAymow&_nc_ss=72289&oh=00_AQEDmvdinebD44WSILPzsUNhLfnHGE7yl2KrpnXQ7U58qQ&oe=6A8F72A0",
          "height": 525,
          "width": 526
        },
        "id": "1602289618299640",
        "url": "https://www.facebook.com/photo/?fbid=1602289618299640&set=gm.1063725826527433&idorvanity=238104155756275"
      }
    ],
    "topComments": [
      {
        "commentId": "1064499803116702",
        "id": "Y29tbWVudDoxMDYzNzI1ODI2NTI3NDMzXzEwNjQ0OTk4MDMxMTY3MDI=",
        "text": "#تحسين_المعدل_مطلبنا\nنطالب وزارة التربية بإصدار قرار تحسين المعدل لدفعة ٢٠٢٦بسبب تكسير الدرجات في التصحيح، إذ إن الكثير من الطلبة حصلوا على درجات لا تعكس مستواهم الحقيقي. نأمل مراعاة هذا الأمر وإنصاف الطلبة بقرار تحسين المعدل، تقديرًا لتعبهم طوال السنة الدراسية...",
        "threadingDepth": 0,
        "profileId": "1044303168486860",
        "profileName": "Anonymous participant 280",
        "commentUrl": "https://www.facebook.com/groups/238104155756275/permalink/1063725826527433/?comment_id=1064499803116702"
      },
      {
        "commentId": "1064523019781047",
        "id": "Y29tbWVudDoxMDYzNzI1ODI2NTI3NDMzXzEwNjQ1MjMwMTk3ODEwNDc=",
        "text": "يارب تحسين معدل",
        "threadingDepth": 0,
        "profileId": "pfbid034eLNc661bjggcWNhbMNCTUuta7RxX2RKLvLqrZfsv7FeqvPtRevRepU4WTWwoTkl",
        "profileName": "يوسف حسن",
        "commentUrl": "https://www.facebook.com/groups/238104155756275/permalink/1063725826527433/?comment_id=1064523019781047"
      }
    ],
    "facebookId": "238104155756275",
    "legacyId": "1063725826527433",
    "id": "UzpfSTEwNjg2NjUxODI3ODczNDY6Vks6MTA2MzcyNTgyNjUyNzQzMw==",
    "user": {
      "id": "1068665182787346",
      "name": "OutgoingJackfruit9976"
    },
    "text": "#تحسين_المعدل_مطالبنا \nاتمنى من كل استاذ او شخص يعمل بل تربية يوصل صوتنا شنو ذنب الطالب المجتهد يضيع حلمه وتعبه بسبب درجة وحدة او مادتين مكسورات ليش محد ينصف الطلاب المجتهدين ولو بقرار واحد والله اني كلبي عيتطكع واني اشوف ابني يذوب كدامي من شدة القهر على المعدل جان يريد طب وما يفصله عنه غير بس خطأ بمادة الرياضيات ونسيان فرع بمادة الفيزياء وراح حلمه وتعبه ليش محد ينظر لهاي الشريحة من الطلاب بقرار تحسينا المعدل يلي هو ابد ما يضر بالدولة \nاتمنى من كل انسان خير ينظر بحالنا والله تعبنا وادمرت احلام اولادنا ليش ما تفرحون الطلاب المجتهدين بهاذا القرار حتى لو مع سنة الخ لان ابني راد يعيد السنة بس هو ممتحن كل المواد وما يكدر الا يجي تحسين 😔💔",
    "feedbackId": "ZmVlZGJhY2s6MTA2MzcyNTgyNjUyNzQzMw==",
    "commentsCount": 36,
    "topReactionsCount": 1,
    "reactionLikeCount": 53,
    "likesCount": 53,
    "sharesCount": 1,
    "time": "2026-08-22T09:05:33.000Z",
    "timeSource": "story",
    "unitTime": null,
    "photoCount": 1,
    "additionalPhotoCount": 0,
    "url": "https://www.facebook.com/groups/238104155756275/permalink/1063725826527433/",
    "isMarketplaceListing": false,
    "groupTitle": "السادس العلمي 26🤍27"
  },
  {
    "facebookUrl": "https://www.facebook.com/groups/238104155756275/",
    "inputUrl": "https://www.facebook.com/groups/238104155756275/",
    "attachments": [
      {
        "thumbnail": "https://scontent-waw2-2.xx.fbcdn.net/v/t39.30808-6/784232205_1096742762708921_2057059755075824465_n.jpg?stp=dst-jpg_tt6&cstp=mx1280x720&ctp=s960x960&_nc_cat=105&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=jo8yXmi7pb4Q7kNvwHKKwHo&_nc_oc=Adri6l-LdPKue03GA4KNWHkdAE0W7i-UMt8eh7SOs9-11pR45tWhg-YMbuQ5Acn1WVA&_nc_zt=23&_nc_ht=scontent-waw2-2.xx&_nc_gid=tKrgRFj6st_7lFSBzalJcA&_nc_ss=7d289&oh=00_AQEXQXsqpUsEfsiPCR-bBwCeNG7F8PYcXstT7sl4lV6jZg&oe=6A8F9DDB",
        "__typename": "Photo",
        "photo_image": {
          "uri": "https://scontent-waw2-2.xx.fbcdn.net/v/t39.30808-6/784232205_1096742762708921_2057059755075824465_n.jpg?stp=dst-jpg_tt6&cstp=mx1280x720&ctp=s960x960&_nc_cat=105&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=jo8yXmi7pb4Q7kNvwHKKwHo&_nc_oc=Adri6l-LdPKue03GA4KNWHkdAE0W7i-UMt8eh7SOs9-11pR45tWhg-YMbuQ5Acn1WVA&_nc_zt=23&_nc_ht=scontent-waw2-2.xx&_nc_gid=tKrgRFj6st_7lFSBzalJcA&_nc_ss=7d289&oh=00_AQEXQXsqpUsEfsiPCR-bBwCeNG7F8PYcXstT7sl4lV6jZg&oe=6A8F9DDB",
          "height": 540,
          "width": 960
        },
        "id": "1096742759375588",
        "url": "https://www.facebook.com/photo/?fbid=1096742759375588&set=gm.1063973046502711&idorvanity=238104155756275"
      }
    ],
    "topComments": [
      {
        "commentId": "1064636063103076",
        "id": "Y29tbWVudDoxMDYzOTczMDQ2NTAyNzExXzEwNjQ2MzYwNjMxMDMwNzY=",
        "text": "حبيبي صدك تحجي !!! طالب 27 كاعد تشوف مراجعة مركزة انت أهنأ كاعد تدمر نفسك بنفسك والي ينصحك يكول ي كبل مراجعة مركزة هذا يضحك عليك لان هو المادة لأزمة بعقلة بحيث يشوفها شغلة صحيحة وهذا اكبر غلط",
        "threadingDepth": 0,
        "profileId": "938774785235484",
        "profileName": "ThoughtfulLobster1840",
        "commentUrl": "https://www.facebook.com/groups/238104155756275/permalink/1063973046502711/?comment_id=1064636063103076"
      },
      {
        "commentId": "1064564896443526",
        "id": "Y29tbWVudDoxMDYzOTczMDQ2NTAyNzExXzEwNjQ1NjQ4OTY0NDM1MjY=",
        "text": "100 تجيب",
        "threadingDepth": 0,
        "profileId": "100086598710814",
        "profileName": "مروان حميد",
        "commentUrl": "https://www.facebook.com/groups/238104155756275/permalink/1063973046502711/?comment_id=1064564896443526"
      }
    ],
    "facebookId": "238104155756275",
    "legacyId": "1063973046502711",
    "id": "UzpfSTEwMjc0Nzg1NzM0MjcxMDI6Vks6MTA2Mzk3MzA0NjUwMjcxMQ==",
    "user": {
      "id": "1027478573427102",
      "name": "GenuineReindeer1094"
    },
    "text": "اكدر اعتمد ع مراجعه المركزه لفضل الهاشمي د٢٧؟؟!!",
    "feedbackId": "ZmVlZGJhY2s6MTA2Mzk3MzA0NjUwMjcxMQ==",
    "commentsCount": 6,
    "topReactionsCount": 1,
    "reactionLikeCount": 12,
    "likesCount": 12,
    "sharesCount": 0,
    "time": "2026-08-22T09:04:16.000Z",
    "timeSource": "story",
    "unitTime": null,
    "photoCount": 1,
    "additionalPhotoCount": 0,
    "url": "https://www.facebook.com/groups/238104155756275/permalink/1063973046502711/",
    "isMarketplaceListing": false,
    "groupTitle": "السادس العلمي 26🤍27"
  },
  {
    "facebookUrl": "https://www.facebook.com/groups/238104155756275/",
    "inputUrl": "https://www.facebook.com/groups/238104155756275/",
    "attachments": [
      {
        "thumbnail": "https://scontent.fccs9-1.fna.fbcdn.net/v/t39.30808-6/784327180_122178829082674633_1775602564293128581_n.jpg?stp=dst-jpg_tt6&cstp=mx1024x1024&ctp=p526x296&_nc_cat=102&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=lLq-_mNdaLcQ7kNvwFUdDE7&_nc_oc=AdozSEBpOL3GHljQPXEhBwDUdkgXiXUAgUM319WYbkjDZ320L9IYescmNs84lytGg5E&_nc_zt=23&_nc_ht=scontent.fccs9-1.fna&_nc_gid=VCMCDNTdNdl-bRCdagPUFg&_nc_ss=72289&oh=00_AQFb5x5NMpYF6iZ8zSlmpczsGrc1o2_xkatV9GulukPG5Q&oe=6A8F7EB0",
        "__typename": "Photo",
        "photo_image": {
          "uri": "https://scontent.fccs9-1.fna.fbcdn.net/v/t39.30808-6/784327180_122178829082674633_1775602564293128581_n.jpg?stp=dst-jpg_tt6&cstp=mx1024x1024&ctp=p526x296&_nc_cat=102&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=lLq-_mNdaLcQ7kNvwFUdDE7&_nc_oc=AdozSEBpOL3GHljQPXEhBwDUdkgXiXUAgUM319WYbkjDZ320L9IYescmNs84lytGg5E&_nc_zt=23&_nc_ht=scontent.fccs9-1.fna&_nc_gid=VCMCDNTdNdl-bRCdagPUFg&_nc_ss=72289&oh=00_AQFb5x5NMpYF6iZ8zSlmpczsGrc1o2_xkatV9GulukPG5Q&oe=6A8F7EB0",
          "height": 526,
          "width": 526
        },
        "id": "122178829076674633",
        "url": "https://www.facebook.com/photo/?fbid=122178829076674633&set=gm.1064159243150758&idorvanity=238104155756275"
      }
    ],
    "topComments": [],
    "facebookId": "238104155756275",
    "legacyId": "1064159243150758",
    "id": "UzpfSTkwNjUwODgxODc3MzE0MzpWSzoxMDY0MTU5MjQzMTUwNzU4",
    "user": {
      "id": "906508818773143",
      "name": "ForgivingOlive1944"
    },
    "text": "السلام عليكم \nاي شخص يحتاج علاج للاسنان\nيتوفر علاج مجاني لجميع الحالات المذكورة \nالموقع /الكرادة -ساحة الاندلس -عيادات جامعة الاسراء \nالحجز والاستفسار \n07738565973 \nواتساب فقط ..\nمع التقدير",
    "feedbackId": "ZmVlZGJhY2s6MTA2NDE1OTI0MzE1MDc1OA==",
    "commentsCount": 0,
    "topReactionsCount": 0,
    "likesCount": 0,
    "sharesCount": 0,
    "time": "2026-08-22T09:02:57.000Z",
    "timeSource": "story",
    "unitTime": null,
    "photoCount": 1,
    "additionalPhotoCount": 0,
    "url": "https://www.facebook.com/groups/238104155756275/permalink/1064159243150758/",
    "isMarketplaceListing": false,
    "groupTitle": "السادس العلمي 26🤍27"
  },
  {
    "facebookUrl": "https://www.facebook.com/groups/238104155756275/",
    "inputUrl": "https://www.facebook.com/groups/238104155756275/",
    "attachments": [
      {
        "thumbnail": "https://scontent.ftlv1-1.fna.fbcdn.net/v/t39.30808-6/784233142_2248692608868847_2979979928443983374_n.jpg?stp=dst-jpg_tt6&cstp=mx1080x291&ctp=s1080x291&_nc_cat=110&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=693hCYoLbwgQ7kNvwE1YGWq&_nc_oc=AdpemNZO9st2WlipM8Rx_nTcR7PBPzJ2Yf0zRZzI2VSqK0Rf8M1j5WznjzcT9j7vTqg&_nc_zt=23&_nc_ht=scontent.ftlv1-1.fna&_nc_gid=Ov23uzBnBpJW2lJsLYKPTg&_nc_ss=72289&oh=00_AQHQ2FGR3aiWbnSDjJE8RUpWUdW3j-4fYnTFC2u7TanpKw&oe=6A8F9A53",
        "__typename": "Photo",
        "photo_image": {
          "uri": "https://scontent.ftlv1-1.fna.fbcdn.net/v/t39.30808-6/784233142_2248692608868847_2979979928443983374_n.jpg?stp=dst-jpg_tt6&cstp=mx1080x291&ctp=s1080x291&_nc_cat=110&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=693hCYoLbwgQ7kNvwE1YGWq&_nc_oc=AdpemNZO9st2WlipM8Rx_nTcR7PBPzJ2Yf0zRZzI2VSqK0Rf8M1j5WznjzcT9j7vTqg&_nc_zt=23&_nc_ht=scontent.ftlv1-1.fna&_nc_gid=Ov23uzBnBpJW2lJsLYKPTg&_nc_ss=72289&oh=00_AQHQ2FGR3aiWbnSDjJE8RUpWUdW3j-4fYnTFC2u7TanpKw&oe=6A8F9A53",
          "height": 291,
          "width": 1080
        },
        "id": "2248692605535514",
        "url": "https://www.facebook.com/photo/?fbid=2248692605535514&set=gm.1064369896463026&idorvanity=238104155756275"
      }
    ],
    "topComments": [
      {
        "commentId": "1064502063116476",
        "id": "Y29tbWVudDoxMDY0MzY5ODk2NDYzMDI2XzEwNjQ1MDIwNjMxMTY0NzY=",
        "text": "هاي لجنة وضع الاسئلة قديمه هسه اختلفوا ممنوع يحطون شي من اسئلة الدور الاول",
        "threadingDepth": 0,
        "profileId": "1622084652765409",
        "profileName": "Al_shmari313",
        "commentUrl": "https://www.facebook.com/groups/238104155756275/permalink/1064369896463026/?comment_id=1064502063116476"
      },
      {
        "commentId": "1064443539788995",
        "id": "Y29tbWVudDoxMDY0MzY5ODk2NDYzMDI2XzEwNjQ0NDM1Mzk3ODg5OTU=",
        "text": "واني شكو شي اجة بدور الارل داسويلة سكب",
        "threadingDepth": 0,
        "profileId": "1430917598850410",
        "profileName": "BreathtakingBison5254",
        "commentUrl": "https://www.facebook.com/groups/238104155756275/permalink/1064369896463026/?comment_id=1064443539788995"
      }
    ],
    "facebookId": "238104155756275",
    "legacyId": "1064369896463026",
    "id": "UzpfSTEwMjkwOTA0MDMzMzk0ODc6Vks6MTA2NDM2OTg5NjQ2MzAyNg==",
    "user": {
      "id": "1029090403339487",
      "name": "بندر والسادس قصه حب"
    },
    "text": "هاي نصيحه لكل واحد يكول الي بالدور الاول مايجي بالدور الثاني !",
    "feedbackId": "ZmVlZGJhY2s6MTA2NDM2OTg5NjQ2MzAyNg==",
    "commentsCount": 61,
    "topReactionsCount": 1,
    "reactionLikeCount": 106,
    "likesCount": 106,
    "sharesCount": 0,
    "time": "2026-08-22T09:02:40.000Z",
    "timeSource": "story",
    "unitTime": null,
    "photoCount": 1,
    "additionalPhotoCount": 0,
    "url": "https://www.facebook.com/groups/238104155756275/permalink/1064369896463026/",
    "isMarketplaceListing": false,
    "groupTitle": "السادس العلمي 26🤍27"
  },
  {
    "facebookUrl": "https://www.facebook.com/groups/238104155756275/",
    "inputUrl": "https://www.facebook.com/groups/238104155756275/",
    "attachments": [
      {
        "thumbnail": "https://scontent.fhan5-6.fna.fbcdn.net/v/t39.30808-6/784080193_999776149772952_381924154728417148_n.jpg?stp=dst-jpg_tt6&cstp=mx1024x1536&ctp=p526x296&_nc_cat=103&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=xSZcxkwO-3YQ7kNvwHAdhm9&_nc_oc=AdrPIHVLUVOsfCGD9CDxV-MivO1kCxW3syRxWOW2y-THYXXNx9sWAU2B-fo7P7qqT3Y&_nc_zt=23&_nc_ht=scontent.fhan5-6.fna&_nc_gid=kbWj_GsJtUTeciSnj5Fadw&_nc_ss=72289&oh=00_AQGBdQ2cYZc1iwnMi61okUoOIAbE4sNX2RWvi21nwmSwBQ&oe=6A8F926B",
        "__typename": "Photo",
        "photo_image": {
          "uri": "https://scontent.fhan5-6.fna.fbcdn.net/v/t39.30808-6/784080193_999776149772952_381924154728417148_n.jpg?stp=dst-jpg_tt6&cstp=mx1024x1536&ctp=p526x296&_nc_cat=103&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=xSZcxkwO-3YQ7kNvwHAdhm9&_nc_oc=AdrPIHVLUVOsfCGD9CDxV-MivO1kCxW3syRxWOW2y-THYXXNx9sWAU2B-fo7P7qqT3Y&_nc_zt=23&_nc_ht=scontent.fhan5-6.fna&_nc_gid=kbWj_GsJtUTeciSnj5Fadw&_nc_ss=72289&oh=00_AQGBdQ2cYZc1iwnMi61okUoOIAbE4sNX2RWvi21nwmSwBQ&oe=6A8F926B",
          "height": 789,
          "width": 526
        },
        "id": "999776146439619",
        "url": "https://www.facebook.com/photo/?fbid=999776146439619&set=gm.1064298723136810&idorvanity=238104155756275"
      }
    ],
    "topComments": [
      {
        "commentId": "1064409543125728",
        "id": "Y29tbWVudDoxMDY0Mjk4NzIzMTM2ODEwXzEwNjQ0MDk1NDMxMjU3Mjg=",
        "text": "وين هاي",
        "threadingDepth": 0,
        "profileId": "61593568913731",
        "profileName": "وُتُـــر ۦٰﹾ٭",
        "commentUrl": "https://www.facebook.com/groups/238104155756275/permalink/1064298723136810/?comment_id=1064409543125728"
      }
    ],
    "facebookId": "238104155756275",
    "legacyId": "1064298723136810",
    "id": "UzpfSTEwMDA5MjIxNzI4OTg2ODpWSzoxMDY0Mjk4NzIzMTM2ODEw",
    "user": {
      "id": "100092217289868",
      "name": "فريق العلم نور / ناحية الفرات"
    },
    "text": "اعلان ملازم دراسية مجانية ",
    "feedbackId": "ZmVlZGJhY2s6MTA2NDI5ODcyMzEzNjgxMA==",
    "commentsCount": 6,
    "topReactionsCount": 1,
    "reactionLikeCount": 2,
    "likesCount": 2,
    "sharesCount": 0,
    "time": "2026-08-22T05:04:51.000Z",
    "timeSource": "story",
    "unitTime": null,
    "photoCount": 1,
    "additionalPhotoCount": 0,
    "url": "https://www.facebook.com/groups/238104155756275/permalink/1064298723136810/",
    "isMarketplaceListing": false,
    "groupTitle": "السادس العلمي 26🤍27"
  },
  {
    "facebookUrl": "https://www.facebook.com/groups/238104155756275/",
    "inputUrl": "https://www.facebook.com/groups/238104155756275/",
    "attachments": [
      {
        "thumbnail": "https://scontent.fbkk29-8.fna.fbcdn.net/v/t39.30808-6/783376087_1084958827321807_4644239883092918949_n.jpg?stp=dst-jpg_tt6&cstp=mx2048x2048&ctp=p526x296&_nc_cat=104&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=cjCpC7XWJMcQ7kNvwF1WHrT&_nc_oc=AdqA9Ff2lrVEGf6jisLMAjLlfypRvLcuqqNxVpaJqbZJm2sYzPyKNR80JDyzzy-hLnQ&_nc_zt=23&_nc_ht=scontent.fbkk29-8.fna&_nc_gid=dphziMcWg0L5BmTpSBm1TQ&_nc_ss=72289&oh=00_AQG9JSBVwiaCnfjTwReW5QWbzyH-C7cd4iTzTIGYE3whPQ&oe=6A8F9A59",
        "__typename": "Photo",
        "photo_image": {
          "uri": "https://scontent.fbkk29-8.fna.fbcdn.net/v/t39.30808-6/783376087_1084958827321807_4644239883092918949_n.jpg?stp=dst-jpg_tt6&cstp=mx2048x2048&ctp=p526x296&_nc_cat=104&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=cjCpC7XWJMcQ7kNvwF1WHrT&_nc_oc=AdqA9Ff2lrVEGf6jisLMAjLlfypRvLcuqqNxVpaJqbZJm2sYzPyKNR80JDyzzy-hLnQ&_nc_zt=23&_nc_ht=scontent.fbkk29-8.fna&_nc_gid=dphziMcWg0L5BmTpSBm1TQ&_nc_ss=72289&oh=00_AQG9JSBVwiaCnfjTwReW5QWbzyH-C7cd4iTzTIGYE3whPQ&oe=6A8F9A59",
          "height": 526,
          "width": 526
        },
        "id": "1084958823988474",
        "url": "https://www.facebook.com/photo/?fbid=1084958823988474&set=gm.1064266886473327&idorvanity=238104155756275"
      }
    ],
    "topComments": [
      {
        "commentId": "1064314333135249",
        "id": "Y29tbWVudDoxMDY0MjY2ODg2NDczMzI3XzEwNjQzMTQzMzMxMzUyNDk=",
        "text": "هاي ملزمة استاذ فرحان؟",
        "threadingDepth": 0,
        "profileId": "61557614287064",
        "profileName": "Ki ve",
        "commentUrl": "https://www.facebook.com/groups/238104155756275/permalink/1064266886473327/?comment_id=1064314333135249"
      },
      {
        "commentId": "1064270636472952",
        "id": "Y29tbWVudDoxMDY0MjY2ODg2NDczMzI3XzEwNjQyNzA2MzY0NzI5NTI=",
        "text": "هيا تجارب علميه بس تجي بشكل نشاط",
        "threadingDepth": 0,
        "profileId": "pfbid02oLAyCsNJi9VCAUhmzBKiUQ3fMxFyzF7LmmCkoeoxvauJBWrX9fZVoKqECwuBT3Eml",
        "profileName": "معاذ الجبوري",
        "commentUrl": "https://www.facebook.com/groups/238104155756275/permalink/1064266886473327/?comment_id=1064270636472952"
      }
    ],
    "facebookId": "238104155756275",
    "legacyId": "1064266886473327",
    "id": "UzpfSTEwMzQzNjU3NTk0ODYzMjY6Vks6MTA2NDI2Njg4NjQ3MzMyNw==",
    "user": {
      "id": "1034365759486326",
      "name": "BeautifulReindeer6682"
    },
    "text": "ذني انشطه لو شنو ؟؟",
    "feedbackId": "ZmVlZGJhY2s6MTA2NDI2Njg4NjQ3MzMyNw==",
    "commentsCount": 19,
    "topReactionsCount": 1,
    "reactionLikeCount": 22,
    "likesCount": 22,
    "sharesCount": 0,
    "time": "2026-08-22T04:09:27.000Z",
    "timeSource": "story",
    "unitTime": null,
    "photoCount": 1,
    "additionalPhotoCount": 0,
    "url": "https://www.facebook.com/groups/238104155756275/permalink/1064266886473327/",
    "isMarketplaceListing": false,
    "groupTitle": "السادس العلمي 26🤍27"
  }
];

export function mapRawPostToFacebookPost(raw: RawApifyPost): import('../types').FacebookPost {
  const mediaUrls: string[] = [];
  if (raw.attachments && raw.attachments.length > 0) {
    raw.attachments.forEach(att => {
      const url = att.photo_image?.uri || att.thumbnail || att.url;
      if (url) mediaUrls.push(url);
    });
  }

  const comments: import('../types').FacebookComment[] = (raw.topComments || []).map((c, idx) => ({
    id: c.id || c.commentId || `c_${raw.id}_${idx}`,
    source_comment_id: c.commentId,
    post_id: raw.id,
    author_name: c.profileName || 'مستخدم فيسبوك',
    author_id: c.profileId,
    author_avatar: undefined,
    comment_text: c.text || '',
    likes_count: 0,
    comment_created_at: raw.time || new Date().toISOString(),
  }));

  const text = raw.text || (raw.attachments && raw.attachments.length > 0 ? 'منشور يحتوي على مرفقات وصور' : 'منشور بدون نص');

  return {
    id: raw.id,
    source_post_id: raw.legacyId || raw.id,
    group_id: raw.facebookId || '238104155756275',
    group_name: raw.groupTitle || 'السادس العلمي 26🤍27',
    group_url: raw.facebookUrl || 'https://www.facebook.com/groups/238104155756275/',
    post_url: raw.url || `https://www.facebook.com/groups/238104155756275/permalink/${raw.legacyId || raw.id}/`,
    post_text: text,
    content: text,
    post_created_at: raw.time || new Date().toISOString(),
    media_urls: mediaUrls,
    media_url: mediaUrls[0],
    media_type: mediaUrls.length > 0 ? 'image' : 'none',
    author_name: raw.user?.name || 'مستخدم فيسبوك',
    author_id: raw.user?.id,
    comments_count: raw.commentsCount ?? comments.length,
    reactions_count: raw.likesCount ?? (raw.reactionLikeCount || 0),
    likes_count: raw.likesCount ?? (raw.reactionLikeCount || 0),
    source_api: 'Apify Facebook Scraper (JSON Dataset)',
    comments: comments,
    isSyncedToBase1: false,
    raw_data: raw as any,
  };
}

export const PARSED_FACEBOOK_POSTS = FACEBOOK_SCRAPED_DATASET.map(mapRawPostToFacebookPost);
