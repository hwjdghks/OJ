import psutil
import multiprocessing
from dockerutils import init_base_images
from worker import worker

def main():
    init_base_images()

    workers = []
    num_workers = psutil.cpu_count()
    for idx in range(num_workers):
        process = multiprocessing.Process(target=worker, args=(idx + 1,))
        workers.append(process)
        process.start()

    for process in workers:
        process.join()

if __name__ == '__main__':
    main()