// Simple test to verify DrawerMenu chat navigation routes
const DrawerMenuPath =
  "/Users/luan/Desktop/redeemsoft/components/DrawerMenu.tsx";
const fs = require("fs");

console.log("Testing DrawerMenu chat navigation fix...\n");

try {
  const content = fs.readFileSync(DrawerMenuPath, "utf8");

  // Check for the correct route in developer items
  const devChatMatch = content.match(
    /icon: "chatbubble-outline",\s*label: "Chat",\s*onPress: \(\) => \{\s*onClose\(\);\s*router\.push\("([^"]+)"/,
  );

  // Find company chat navigation too
  const companyLines = content.split("\n");
  let companyChatRoute = null;
  let inCompanyItems = false;

  for (let i = 0; i < companyLines.length; i++) {
    if (companyLines[i].includes("empresaItems: DrawerNavItem[]")) {
      inCompanyItems = true;
    }
    if (inCompanyItems && companyLines[i].includes('"Chat"')) {
      // Look for the route in the next few lines
      for (let j = i; j < i + 5 && j < companyLines.length; j++) {
        const routeMatch = companyLines[j].match(/router\.push\("([^"]+)"/);
        if (routeMatch) {
          companyChatRoute = routeMatch[1];
          break;
        }
      }
      break;
    }
  }

  console.log("📱 Developer Chat Navigation:");
  if (devChatMatch) {
    const devRoute = devChatMatch[1];
    console.log(`   Route: ${devRoute}`);
    if (devRoute === "/(app)/(tabs)/mensagens") {
      console.log("   ✅ CORRECT - Points to Messages tab");
    } else if (devRoute === "/(app)/chat") {
      console.log("   ❌ BUG PRESENT - Points to non-existent chat route");
    } else {
      console.log(`   ⚠️  UNKNOWN - Unexpected route: ${devRoute}`);
    }
  } else {
    console.log("   ❌ Could not find developer chat navigation");
  }

  console.log("\n🏢 Company Chat Navigation:");
  if (companyChatRoute) {
    console.log(`   Route: ${companyChatRoute}`);
    if (companyChatRoute === "/(app)/(tabs)/mensagens") {
      console.log("   ✅ CORRECT - Points to Messages tab");
    } else if (companyChatRoute === "/(app)/chat") {
      console.log("   ❌ BUG PRESENT - Points to non-existent chat route");
    } else {
      console.log(`   ⚠️  UNKNOWN - Unexpected route: ${companyChatRoute}`);
    }
  } else {
    console.log("   ❌ Could not find company chat navigation");
  }

  // Check if the target route exists
  const mensagensTabPath =
    "/Users/luan/Desktop/redeemsoft/app/(app)/(tabs)/mensagens.tsx";
  const mensagensExists = fs.existsSync(mensagensTabPath);

  console.log("\n📂 Target Route Verification:");
  console.log(
    `   /(app)/(tabs)/mensagens.tsx: ${mensagensExists ? "✅ EXISTS" : "❌ MISSING"}`,
  );

  // Overall assessment
  const devFixed =
    devChatMatch && devChatMatch[1] === "/(app)/(tabs)/mensagens";
  const companyFixed = companyChatRoute === "/(app)/(tabs)/mensagens";

  console.log("\n📋 Overall Assessment:");
  if (devFixed && companyFixed && mensagensExists) {
    console.log("   ✅ DrawerMenu chat navigation is FIXED");
    console.log(
      "   ✅ Both developer and company chat routes point to the correct Messages tab",
    );
    console.log("   ✅ Target route file exists");
  } else {
    console.log("   ❌ Issues detected:");
    if (!devFixed)
      console.log("       - Developer chat navigation needs fixing");
    if (!companyFixed)
      console.log("       - Company chat navigation needs fixing");
    if (!mensagensExists)
      console.log("       - Target Messages tab file is missing");
  }
} catch (error) {
  console.error("❌ Error testing DrawerMenu:", error.message);
}
