import { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../lib/mongodb';
import { products as allProducts } from '../../data/products';

// Product data from products.ts with variantCombinations
const productData = allProducts.map(p => ({
  productId: p.productId,
  category: p.category,
  variantCombinations: p.variantCombinations
}));
 
const deviceProfiles = [
  { platform: "web", deviceFingerprint: "WEB1234A", userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36", ipAddress: "192.168.1.10" },
  { platform: "web", deviceFingerprint: "WEB5678B", userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Safari/605.1.15", ipAddress: "10.0.0.5" },
  { platform: "mobile", deviceFingerprint: "MOB1111C", userAgent: "Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36", ipAddress: "172.16.0.2" },
  { platform: "mobile", deviceFingerprint: "MOB2222D", userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.2 Mobile/15E148 Safari/604.1", ipAddress: "192.168.0.22" },
  { platform: "android_app", deviceFingerprint: "ANDR3333E", userAgent: "Dalvik/2.1.0 (Linux; U; Android 10; Redmi Note 8T Build/QKQ1.200114.002)", ipAddress: "203.0.113.5" },
  { platform: "android_app", deviceFingerprint: "ANDR4444F", userAgent: "Dalvik/2.1.0 (Linux; U; Android 12; Pixel 5 Build/SP1A.210812.015)", ipAddress: "198.51.100.23" },
  { platform: "ios_app", deviceFingerprint: "IOS5555G", userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148", ipAddress: "203.0.113.45" },
  { platform: "ios_app", deviceFingerprint: "IOS6666H", userAgent: "Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148", ipAddress: "198.51.100.99" },
  { platform: "web", deviceFingerprint: "WEB7777I", userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36", ipAddress: "10.1.1.1" },
  { platform: "mobile", deviceFingerprint: "MOB8888J", userAgent: "Mozilla/5.0 (Linux; Android 10; SM-A107F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36", ipAddress: "172.16.1.10" },
  { platform: "android_app", deviceFingerprint: "ANDR9999K", userAgent: "Dalvik/2.1.0 (Linux; U; Android 9; Mi A2 Build/PKQ1.180904.001)", ipAddress: "203.0.113.77" },
  { platform: "ios_app", deviceFingerprint: "IOS0000L", userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148", ipAddress: "198.51.100.101" }
];

// Assign 1-3 random device profiles to each user
const users = Array.from({ length: 50 }).map((_, i) => {
  const id = (i + 1).toString().padStart(5, '0');
  // Assign 1-3 random device profiles
  const userDevices = getRandomSubset(deviceProfiles, 1, 3);
  return {
    userId: `USER_${id}`,
    name: `User ${id}`,
    profilePicUrl: `https://cdn.example.com/profiles/user${id}.jpg`,
    location: [
      'Mumbai, India', 'Delhi, India', 'Bangalore, India', 'Hyderabad, India', 'Chennai, India',
      'Kolkata, India', 'Pune, India', 'Ahmedabad, India', 'Jaipur, India', 'Lucknow, India',
      'Kanpur, India', 'Nagpur, India', 'Indore, India', 'Thane, India', 'Bhopal, India',
      'Visakhapatnam, India', 'Pimpri-Chinchwad, India', 'Patna, India', 'Vadodara, India', 'Ghaziabad, India',
      'Ludhiana, India', 'Agra, India', 'Nashik, India', 'Faridabad, India', 'Meerut, India',
      'Rajkot, India', 'Kalyan-Dombivli, India', 'Vasai-Virar, India', 'Varanasi, India', 'Srinagar, India',
      'Aurangabad, India', 'Dhanbad, India', 'Amritsar, India', 'Navi Mumbai, India', 'Allahabad, India',
      'Ranchi, India', 'Howrah, India', 'Coimbatore, India', 'Jabalpur, India', 'Gwalior, India',
      'Vijayawada, India', 'Jodhpur, India', 'Madurai, India', 'Raipur, India', 'Kota, India',
      'Guwahati, India', 'Chandigarh, India', 'Solapur, India', 'Hubli–Dharwad, India', 'Mysore, India'
    ][i],
    verifiedBuyer: Math.random() < 0.7, // 70% chance to be verified
    devices: userDevices
  };
});


// Helper to generate random rating object
function randomRatingObject() {
  const quality = Math.floor(Math.random() * 5) + 1;
  const valueForMoney = Math.floor(Math.random() * 5) + 1;
  const delivery = Math.floor(Math.random() * 5) + 1;
  const packaging = Math.floor(Math.random() * 5) + 1;
  const fit = Math.floor(Math.random() * 5) + 1;
  const avg = (quality + valueForMoney + delivery + packaging + fit) / 5;
  const overall = Math.round(avg * 2) / 2;
  return {
    overall,
    quality,
    valueForMoney,
    delivery,
    packaging,
    fit
  };
}

// Helper to generate random timestamp for 2025
function randomTimestamp2025() {
  const startDate = new Date('2025-01-01T00:00:00.000Z');
  const endDate = new Date('2025-12-31T23:59:59.999Z');
  const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
  return new Date(randomTime).toISOString();
}

function randomPurchaseDate2025() {
  const start = new Date('2025-01-01T00:00:00.000Z').getTime();
  const end = new Date('2025-12-31T23:59:59.999Z').getTime();
  const randomTime = start + Math.random() * (end - start);
  return new Date(randomTime);
}

function randomReviewDate(purchaseDate) {
  const minDays = 5;
  const maxDays = 10;
  const daysToAdd = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
  const reviewTime = purchaseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000 + Math.floor(Math.random() * 86400000); // add random time in the day
  return new Date(reviewTime);
}

function randomInt(max) {
  return Math.floor(Math.random() * (max + 1));
}

// 20 sample review data
const reviewSamples = [
  {
    title: "Great product but slightly tight",
    reviewText: "I loved the material and finish. Delivery was quick, but size was slightly tight. I'd recommend buying one size up.",
    pros: ["High quality fabric", "Delivered on time", "Eco-friendly packaging"],
    cons: ["Size runs small"]
  },
  {
    title: "Excellent value for money",
    reviewText: "The product exceeded my expectations for the price. Will definitely buy again.",
    pros: ["Affordable", "Good quality", "Fast shipping"],
    cons: []
  },
  {
    title: "Color not as shown",
    reviewText: "The color was a bit different from the pictures, but overall quality is good.",
    pros: ["Soft material", "Comfortable fit"],
    cons: ["Color mismatch"]
  },
  {
    title: "Perfect fit and comfortable",
    reviewText: "Fits perfectly and is very comfortable for daily wear.",
    pros: ["Perfect fit", "Comfortable", "Good stitching"],
    cons: []
  },
  {
    title: "Packaging could be better",
    reviewText: "Product is good but the packaging was damaged on arrival.",
    pros: ["Good product", "Quick delivery"],
    cons: ["Damaged packaging"]
  },
  {
    title: "Impressed with the quality",
    reviewText: "The quality is top-notch. Will recommend to friends.",
    pros: ["Premium feel", "Durable", "Looks great"],
    cons: []
  },
  {
    title: "Late delivery but good product",
    reviewText: "Product is as described but delivery took longer than expected.",
    pros: ["Good quality", "Nice design"],
    cons: ["Late delivery"]
  },
  {
    title: "Not true to size",
    reviewText: "The size chart is off. Order a size up for a better fit.",
    pros: ["Nice fabric", "Trendy look"],
    cons: ["Runs small"]
  },
  {
    title: "Great for gifting",
    reviewText: "Bought this as a gift and the recipient loved it!",
    pros: ["Gift-worthy", "Attractive packaging"],
    cons: []
  },
  {
    title: "Average experience",
    reviewText: "Product is okay for the price, but nothing exceptional.",
    pros: ["Affordable"],
    cons: ["Average quality"]
  },
  {
    title: "Superb customer service",
    reviewText: "Had an issue with my order but customer service resolved it quickly.",
    pros: ["Responsive support", "Quick resolution"],
    cons: []
  },
  {
    title: "Material feels cheap",
    reviewText: "The material is not as good as expected. Not sure if I'd buy again.",
    pros: ["Good fit"],
    cons: ["Cheap material"]
  },
  {
    title: "Stylish and trendy",
    reviewText: "Love the style and color. Got many compliments!",
    pros: ["Trendy", "Nice color", "Good fit"],
    cons: []
  },
  {
    title: "Disappointed with the stitching",
    reviewText: "Stitching started coming off after one wash.",
    pros: ["Nice design"],
    cons: ["Poor stitching"]
  },
  {
    title: "Perfect for summer",
    reviewText: "Lightweight and breathable. Perfect for hot weather.",
    pros: ["Breathable", "Lightweight"],
    cons: []
  },
  {
    title: "Not worth the price",
    reviewText: "Expected better quality for the price paid.",
    pros: ["Good packaging"],
    cons: ["Overpriced"]
  },
  {
    title: "Exceeded expectations",
    reviewText: "The product quality and delivery speed exceeded my expectations.",
    pros: ["High quality", "Fast delivery"],
    cons: []
  },
  {
    title: "Too loose for my liking",
    reviewText: "The fit is too loose. Would prefer a more tailored fit.",
    pros: ["Soft fabric"],
    cons: ["Loose fit"]
  },
  {
    title: "Eco-friendly packaging is a plus",
    reviewText: "Loved the eco-friendly packaging. Product is good too.",
    pros: ["Eco-friendly packaging", "Good product"],
    cons: []
  },
  {
    title: "Would not recommend",
    reviewText: "Not satisfied with the product. Would not recommend to others.",
    pros: [],
    cons: ["Poor quality", "Not as described"]
  }
];

// 10 image and 10 video URLs
const imageUrls = [
  "https://images.unsplash.com/photo-1519125323398-675f0ddb6308",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca",
  "https://images.pexels.com/photos/936075/pexels-photo-936075.jpeg",
  "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg",
  "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg",
  "https://cdn.pixabay.com/photo/2016/11/29/09/32/adult-1868750_1280.jpg",
  "https://cdn.pixabay.com/photo/2015/03/26/09/54/people-690547_1280.jpg",
  "https://cdn.pixabay.com/photo/2016/03/27/22/16/girl-1284419_1280.jpg",
  "https://cdn.pixabay.com/photo/2017/08/06/00/03/people-2588594_1280.jpg"
];
const videoUrls = [
  "https://www.pexels.com/video/857195/download/",
  "https://www.pexels.com/video/854190/download/",
  "https://www.pexels.com/video/856998/download/",
  "https://www.pexels.com/video/3184411/download/",
  "https://www.pexels.com/video/856997/download/",
  "https://www.pexels.com/video/855386/download/",
  "https://www.pexels.com/video/855387/download/",
  "https://www.coverr.co/s3/mp4/coverr-morning-coffee-1577975846655.mp4",
  "https://cdn.pixabay.com/video/2020/06/17/09/32/people-5300.mp4",
  "https://cdn.pixabay.com/video/2020/06/17/09/32/people-5301.mp4"
];

function getRandomSubset(arr, min, max) {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = arr.slice().sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

const moderatorIds = Array.from({ length: 15 }).map((_, i) => `MOD_${1001 + i}`);
const moderationComments = {
  positive: [
    "Minor edits for clarity",
    "Auto-approved, no issues",
    "Edited for grammar",
    "Helpful review, approved",
    "Approved after minor changes",
    "Clean content, visible to users",
    "No policy violations found",
    "Approved by moderator",
    "System auto-approved",
    "Reviewed and published"
  ],
  negative: [
    "Policy violation",
    "Spam detected",
    "Rejected due to poor content",
    "Hidden due to DMCA request",
    "Flagged for abusive language",
    "Rejected: not relevant",
    "Archived for statistics",
    "Rejected: duplicate content",
    "Hidden by moderator",
    "Rejected: fake review"
  ]
};
const statusOptions = ["approved", "pending", "rejected", "flagged", "hidden", "archived"];

function randomStatus() {
  return statusOptions[Math.floor(Math.random() * statusOptions.length)];
}
function randomModerator() {
  return moderatorIds[Math.floor(Math.random() * moderatorIds.length)];
}
function randomModerationComment(status) {
  if (status === "approved" || status === "flagged") {
    return moderationComments.positive[Math.floor(Math.random() * moderationComments.positive.length)];
  } else if (["rejected", "hidden", "archived"].includes(status)) {
    return moderationComments.negative[Math.floor(Math.random() * moderationComments.negative.length)];
  }
  return null;
}
function randomModeration(reviewDate, status) {
  if (status === "pending") return null;
  const minDays = 1, maxDays = 3;
  const daysToAdd = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
  const reviewedAt = new Date(new Date(reviewDate).getTime() + daysToAdd * 24 * 60 * 60 * 1000 + Math.floor(Math.random() * 86400000));
  return {
    reviewedBy: randomModerator(),
    reviewedAt: reviewedAt.toISOString(),
    comments: randomModerationComment(status)
  };
}

const tagList = [
  "tight fit", "great quality", "eco packaging", "fast delivery", "runs small", "colorful", "soft fabric", "durable", "affordable", "stylish", "comfortable", "good stitching", "premium feel", "gift-worthy", "lightweight", "breathable", "trendy", "nice packaging", "responsive support", "easy returns"
];

const customerList = [
  { authorId: "USER_44321", authorName: "Priya R" },
  { authorId: "USER_99887", authorName: "Amit S" },
  { authorId: "USER_11223", authorName: "Neha K" },
  { authorId: "USER_33445", authorName: "Rahul M" },
  { authorId: "USER_55667", authorName: "Sneha T" },
  { authorId: "USER_77889", authorName: "Vikas P" },
  { authorId: "USER_99001", authorName: "Anjali D" },
  { authorId: "USER_22334", authorName: "Rohit G" },
  { authorId: "USER_44556", authorName: "Meera L" },
  { authorId: "USER_66778", authorName: "Karan J" },
  { authorId: "USER_88990", authorName: "Divya S" },
  { authorId: "USER_10112", authorName: "Suresh N" },
  { authorId: "USER_12132", authorName: "Pooja V" },
  { authorId: "USER_14152", authorName: "Arjun B" },
  { authorId: "USER_16172", authorName: "Ritu C" }
];

const moderatorList = Array.from({ length: 15 }).map((_, i) => ({
  authorId: `MOD_${1001 + i}`,
  authorName: `Moderator ${i + 1}`
}));

const replyTexts = [
  "Thank you for your kind review!",
  "We appreciate your feedback.",
  "Sorry to hear about the issue.",
  "We're glad you liked it!",
  "We'll work on improving this.",
  "Thanks for shopping with us!",
  "Your suggestion is noted.",
  "Please contact support for help.",
  "We're looking into this.",
  "Happy to help!",
  "Thanks for highlighting this.",
  "We'll pass this to our team.",
  "Hope to serve you again!",
  "We value your opinion.",
  "Let us know if you need anything else."
];

function getRandomTags() {
  return getRandomSubset(tagList, 0, 4);
}

function getRandomReplies(status, reviewedAt, reviewDate) {
  if (status !== "approved") return [];
  const replyCount = Math.floor(Math.random() * 21); // 0-20
  const replies: any[] = [];
  for (let i = 0; i < replyCount; i++) {
    const replyId = `R_${(i + 1).toString().padStart(3, '0')}`;
    const authorRole = getRandomSubset(["store_owner", "customer", "moderator", "system"], 1, 1)[0];
    let authorId = "", authorName = "";
    if (authorRole === "store_owner") {
      authorId = "USER_00000";
      authorName = "Store Owner";
    } else if (authorRole === "customer") {
      const cust = customerList[Math.floor(Math.random() * customerList.length)];
      authorId = cust.authorId;
      authorName = cust.authorName;
    } else if (authorRole === "moderator") {
      const mod = moderatorList[Math.floor(Math.random() * moderatorList.length)];
      authorId = mod.authorId;
      authorName = mod.authorName;
    } else if (authorRole === "system") {
      authorId = "SYSTEM";
      authorName = "System";
    }
    const text = replyTexts[Math.floor(Math.random() * replyTexts.length)];
    // Date: random after reviewedAt (or reviewDate if no moderation)
    const baseDate = reviewedAt ? new Date(reviewedAt) : new Date(reviewDate);
    const replyDate = new Date(baseDate.getTime() + (Math.floor(Math.random() * 3) + 1) * 60 * 60 * 1000 + Math.floor(Math.random() * 86400000));
    replies.push({
      replyId,
      authorId,
      authorRole,
      authorName,
      text,
      date: replyDate.toISOString()
    });
  }
  return replies;
}

function randomOrderId() {
  return `orderId_${Math.floor(100000 + Math.random() * 900000)}`;
}
function randomDeliveryTime(purchaseDate, reviewDate) {
  const minDays = 4, maxDays = 7;
  const purchase = new Date(purchaseDate).getTime();
  const review = new Date(reviewDate).getTime();
  let deliveryTime;
  for (let i = 0; i < 10; i++) { // try up to 10 times to get a valid date
    const daysToAdd = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
    const candidate = purchase + daysToAdd * 24 * 60 * 60 * 1000 + Math.floor(Math.random() * 86400000);
    if (candidate < review) {
      deliveryTime = new Date(candidate);
      break;
    }
  }
  if (!deliveryTime) deliveryTime = new Date(purchase + minDays * 24 * 60 * 60 * 1000); // fallback
  return deliveryTime.toISOString();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const db = await getDb();
    const reviews = Array.from({ length: 9999 }).map(() => {
      const randomProduct = productData[Math.floor(Math.random() * productData.length)];
      const variants = randomProduct.variantCombinations || [];
      const randomVariant = variants.length > 0 ? variants[Math.floor(Math.random() * variants.length)] : null;
      const timestamp = randomTimestamp2025();
      const user = users[Math.floor(Math.random() * users.length)];
      const device = user.devices[Math.floor(Math.random() * user.devices.length)];
      const sample = reviewSamples[Math.floor(Math.random() * reviewSamples.length)];
      const images = getRandomSubset(imageUrls, 0, 5);
      const videos = getRandomSubset(videoUrls, 0, 2);
      const purchaseDateObj = randomPurchaseDate2025();
      const reviewDateObj = randomReviewDate(purchaseDateObj);
      const status = randomStatus();
      const moderation = randomModeration(reviewDateObj.toISOString(), status);
      const tags = getRandomTags();
      const replies = getRandomReplies(status, moderation?.reviewedAt, reviewDateObj.toISOString());
      return { 
        _id: timestamp, // Manual string _id with 2025 timestamp format
        productId: randomProduct.productId,
        category: randomProduct.category,
        variantId: randomVariant?.variantId || null,
        combination: randomVariant?.combination || null,
        user,
        platform: device.platform,
        deviceFingerprint: device.deviceFingerprint,
        userAgent: device.userAgent,
        ipAddress: device.ipAddress,
        language: 'en',
        orderId: randomOrderId(),
        deliveryTime: randomDeliveryTime(purchaseDateObj.toISOString(), reviewDateObj.toISOString()),
        rating: randomRatingObject(),
        title: sample.title,
        reviewText: sample.reviewText,
        pros: sample.pros,
        cons: sample.cons,
        media: {
          images,
          videos
        },
        purchaseDate: purchaseDateObj.toISOString(),
        reviewDate: reviewDateObj.toISOString(),
        likes: randomInt(1000),
        dislikes: randomInt(1000),
        helpfulVotes: randomInt(1000),
        reported: false,
        status,
        moderation,
        tags,
        isEdited: false,
        replies,
        createdAt: timestamp,
      };
    });
    const ops = reviews.map((doc) => ({ insertOne: { document: doc } }));
    const result = await db.collection('reviews').bulkWrite(ops as any, { ordered: false });
    res.status(200).json({ insertedCount: result.insertedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
} 