import prisma from "./src/config/prisma";
import { TaskStatus, TaskPriority, NotificationType, Role } from "./src/generated/prisma/enums";
import { hashPassword } from "./src/utils/hash";

async function seedDemoData() {
  console.log("Seeding demo data...");

  // 1. Create Demo User
  const demoEmail = "demo@nexora.app";
  const demoPassword = "Demo@12345";
  const hashedPassword = await hashPassword(demoPassword);

  let demoUser = await prisma.user.findUnique({
    where: { email: demoEmail },
  });

  if (!demoUser) {
    demoUser = await prisma.user.create({
      data: {
        name: "Demo User",
        email: demoEmail,
        password: hashedPassword,
        isVerified: true,
      },
    });
    console.log("Demo user created.");
  } else {
    // Ensure password is correct
    await prisma.user.update({
      where: { id: demoUser.id },
      data: { password: hashedPassword },
    });
    console.log("Demo user updated.");
  }

  // 2. Create Team Members (Dummy users)
  const teamEmails = ["alice@nexora.app", "bob@nexora.app", "charlie@nexora.app"];
  const teamUsers = [];
  for (const email of teamEmails) {
    let u = await prisma.user.findUnique({ where: { email } });
    if (!u) {
      u = await prisma.user.create({
        data: {
          name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
          email,
          password: hashedPassword,
          isVerified: true,
        },
      });
    }
    teamUsers.push(u);
  }

  // 3. Create Demo Workspace
  let demoWorkspace = await prisma.workspace.findFirst({
    where: { ownerId: demoUser.id, name: "NEXORA Demo Workspace" },
  });

  if (!demoWorkspace) {
    demoWorkspace = await prisma.workspace.create({
      data: {
        name: "NEXORA Demo Workspace",
        description: "A complete workspace with sample data to explore NEXORA.",
        ownerId: demoUser.id,
        members: {
          create: [
            { userId: demoUser.id, role: Role.OWNER },
            ...teamUsers.map(u => ({ userId: u.id, role: Role.MEMBER }))
          ],
        },
      },
    });
    console.log("Demo workspace created.");
  }

  // 4. Create Projects
  const projectsCount = await prisma.project.count({ where: { workspaceId: demoWorkspace.id } });
  if (projectsCount === 0) {
    const webProject = await prisma.project.create({
      data: {
        name: "Website Redesign",
        description: "Overhaul the main landing page and marketing site.",
        emoji: "🌐",
        workspaceId: demoWorkspace.id,
        createdById: demoUser.id,
      }
    });

    const mobileProject = await prisma.project.create({
      data: {
        name: "Mobile App V2",
        description: "Develop the new version of the iOS and Android app.",
        emoji: "📱",
        workspaceId: demoWorkspace.id,
        createdById: demoUser.id,
      }
    });

    // 5. Create Tasks for Web Project
    await prisma.task.createMany({
      data: [
        { title: "Design new hero section", description: "Use 3D assets and dark theme.", status: TaskStatus.DONE, priority: TaskPriority.HIGH, projectId: webProject.id, createdById: demoUser.id, assigneeId: teamUsers[0].id },
        { title: "Implement responsive layout", description: "Ensure it works on mobile.", status: TaskStatus.IN_PROGRESS, priority: TaskPriority.MEDIUM, projectId: webProject.id, createdById: demoUser.id, assigneeId: demoUser.id },
        { title: "Add demo login flow", description: "Allow users to try without signup.", status: TaskStatus.TODO, priority: TaskPriority.HIGH, projectId: webProject.id, createdById: demoUser.id, assigneeId: demoUser.id },
      ]
    });

    // Create Tasks for Mobile Project
    await prisma.task.createMany({
      data: [
        { title: "Setup React Native env", description: "Initialize Expo project.", status: TaskStatus.DONE, priority: TaskPriority.HIGH, projectId: mobileProject.id, createdById: teamUsers[1].id, assigneeId: teamUsers[1].id },
        { title: "Build navigation", description: "Implement tab navigator.", status: TaskStatus.IN_PROGRESS, priority: TaskPriority.MEDIUM, projectId: mobileProject.id, createdById: teamUsers[1].id, assigneeId: teamUsers[2].id },
        { title: "Push notifications integration", description: "Use Firebase.", status: TaskStatus.TODO, priority: TaskPriority.LOW, projectId: mobileProject.id, createdById: demoUser.id, assigneeId: demoUser.id },
      ]
    });

    console.log("Projects and tasks created.");

    // 6. Create Channels and Messages
    const generalChannel = await prisma.channel.create({
      data: { name: "general", description: "General workspace discussion", workspaceId: demoWorkspace.id, createdById: demoUser.id }
    });
    const engChannel = await prisma.channel.create({
      data: { name: "engineering", description: "Dev talk", workspaceId: demoWorkspace.id, createdById: demoUser.id }
    });

    await prisma.message.createMany({
      data: [
        { content: "Welcome to the new workspace!", channelId: generalChannel.id, createdById: demoUser.id, workspaceId: demoWorkspace.id },
        { content: "Thanks! The new UI looks great.", channelId: generalChannel.id, createdById: teamUsers[0].id, workspaceId: demoWorkspace.id },
        { content: "Has anyone checked the latest API docs?", channelId: engChannel.id, createdById: teamUsers[1].id, workspaceId: demoWorkspace.id },
        { content: "Yes, I'm working on the integration now.", channelId: engChannel.id, createdById: demoUser.id, workspaceId: demoWorkspace.id },
      ]
    });

    // 7. Create Documents
    await prisma.document.create({
      data: {
        title: "API Requirements",
        content: "# API Requirements\n\n1. Use REST principles\n2. Return standard HTTP status codes\n3. Include pagination for lists",
        workspaceId: demoWorkspace.id,
        createdById: demoUser.id,
      }
    });

    // 8. Create Notifications
    await prisma.notification.create({
      data: {
        type: NotificationType.TASK_ASSIGNED,
        title: "New Task Assigned",
        message: "You have been assigned to 'Implement responsive layout'",
        userId: demoUser.id,
      }
    });
  }

  console.log("Demo data setup complete.");
}

seedDemoData()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
