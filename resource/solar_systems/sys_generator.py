import pygame
import sys
import json
import os

def get_next_filename(prefix, suffix=".json"):
    count = 1
    while True:
        filename = f"{prefix}{count:04d}{suffix}"
        if not os.path.exists(filename):
            print(f"Saving to {filename}")
            return filename
        count += 1

def draw_circle_alpha(surface, color, center, radius):
    target_rect = pygame.Rect(center, (0, 0)).inflate((radius * 2, radius * 2))
    shape_surf = pygame.Surface(target_rect.size, pygame.SRCALPHA)
    pygame.draw.circle(shape_surf, color, (radius, radius), radius)
    surface.blit(shape_surf, target_rect)

def saveSystem(circles, connections):
    # circles[...] = [position, radius, color, name, isOccupied]
    to_save_circles = [{"name": c[3], "occupied": c[4], "x": c[0][0], "y": c[0][1], "radius": c[1]} for c in circles]
    # connections[...] = (indexA, indexB)
    to_save_connections = [{"A": circles[c[0]][3], "B": circles[c[1]][3]} for c in connections]
    print(circles[0])
    print(connections[0])
    dict_to_save = {'planets': to_save_circles, 'connections': to_save_connections}
    with open(get_next_filename("gen_sys"), 'w') as f:
        json.dump(dict_to_save, f)

# Initialize Pygame
pygame.init()

# Set up the screen dimensions
WIDTH, HEIGHT = 1800, 900
screen = pygame.display.set_mode((WIDTH, HEIGHT), pygame.DOUBLEBUF, 32)
pygame.display.set_caption("Click to Add Circles")

# Colors
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
RED = (255, 0, 0)
GREEN = (0, 255, 0)
YELLOW = (255, 255, 0)

# Circle parameters
brush_circle_radius = 30
min_radius = 20
max_radius = 100
radius_change = 5

# List to store circle positions and colors
circles = []
connections = []
conA = None
conB = None

# Main loop
running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        elif event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
            mouse_pos = pygame.mouse.get_pos()
            circle_clicked = False
            for i, cir_obj in enumerate(circles):
                circle_pos, radius, color, _, _ = cir_obj
                distance = ((mouse_pos[0] - circle_pos[0])**2 + (mouse_pos[1] - circle_pos[1])**2) ** 0.5
                if distance <= radius:
                    circle_clicked = True
                    if conA is None:
                        conA = i
                        circles[conA][2] = GREEN
                    else:
                        conB = i
                        connections.append((conA, conB))
                        circles[conA][2] = YELLOW if circles[conA][4] else RED
                        conA = None
                        conB = None
                    break
            if not circle_clicked:
                circles.append([mouse_pos, brush_circle_radius, RED, str(len(circles)+1), False])
        elif event.type == pygame.MOUSEBUTTONDOWN and event.button == 3:
            mouse_pos = pygame.mouse.get_pos()
            circle_clicked = False
            for i, cir_obj in enumerate(circles):
                circle_pos, radius, color, _, _ = cir_obj
                distance = ((mouse_pos[0] - circle_pos[0])**2 + (mouse_pos[1] - circle_pos[1])**2) ** 0.5
                if distance <= radius:
                    if circles[i][4]:
                        circles[i][2] = RED
                    else:
                        circles[i][2] = YELLOW
                        circles[i][4] = not circles[i][4]


        elif event.type == pygame.KEYDOWN:
            # Increase or decrease brush circle radius with arrow keys
            if event.key == pygame.K_UP:
                brush_circle_radius = min(max_radius, brush_circle_radius + radius_change)
            elif event.key == pygame.K_DOWN:
                brush_circle_radius = max(min_radius, brush_circle_radius - radius_change)
            elif event.key == pygame.K_s:
                saveSystem(circles, connections)

    # Fill the screen with white color
    screen.fill(WHITE)

    # Draw connections
    for con in connections:
        posA = circles[con[0]][0]
        posB = circles[con[1]][0]
        pygame.draw.line(screen, BLACK, posA, posB, 2)

    # Draw circles
    for circle_pos, radius, color, _, _ in circles:
        pygame.draw.circle(screen, color, circle_pos, radius)


    # Draw brush circle at mouse position
    mouse_pos = pygame.mouse.get_pos()
    alpha_red = (RED[0], RED[1], RED[2], 1)
    # pygame.draw.circle(screen, pygame.Color(255, 0, 0, 128), mouse_pos, brush_circle_radius)
    draw_circle_alpha(screen, pygame.Color(100, 0, 255, 128), mouse_pos, brush_circle_radius)

    # Update the display
    pygame.display.flip()

    # Limit frame rate
    pygame.time.Clock().tick(60)

# Quit Pygame
pygame.quit()
sys.exit()
