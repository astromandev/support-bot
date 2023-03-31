import math

def calculate_cosine(angle):
    return math.cos(math.radians(angle))

def calculate_sine(angle):
    return math.sin(math.radians(angle))

def calculate_arccos(value):
    return math.degrees(math.acos(value))

def calculate_arcsin(value):
    return math.degrees(math.asin(value))

def main():
    print("Welcome to the Trigonometry Calculator!")
    while True:
        operation = input("Enter the operation (cosine, sine, arccos, arcsin) or type 'exit' to quit: ").lower()
        
        if operation == 'exit':
            break

        if operation in ('cosine', 'sine'):
            angle = float(input("Enter the angle (in degrees): "))
            if operation == 'cosine':
                result = calculate_cosine(angle)
            else:
                result = calculate_sine(angle)
            print(f"The {operation} of {angle} degrees is {result:.4f}")

        elif operation in ('arccos', 'arcsin'):
            value = float(input("Enter a value between -1 and 1: "))
            if -1 <= value <= 1:
                if operation == 'arccos':
                    result = calculate_arccos(value)
                else:
                    result = calculate_arcsin(value)
                print(f"The {operation} of {value} is {result:.4f} degrees")
            else:
                print("Invalid value. Please enter a number between -1 and 1.")

        else:
            print("Invalid operation. Please try again.")

if __name__ == "__main__":
    main()
